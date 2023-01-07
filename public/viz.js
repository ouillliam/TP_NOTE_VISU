/**
 * On crée la variable qui contiendra le nom du groupe de graphique du dashboard
 */
const groupName = "dataset";

/**
 * Fonction pour reset les filtres et redessiner les graphiques
 */
function reset() {
    dc.filterAll(groupName);
    dc.renderAll(groupName);
}

/**
 * Permet de montrer les % des tranches du pie chart
 * @param chart Le pie chart sur quoi faire la modification
 */
const montrerPourcentagesPieChart = (chart) => {
    chart.selectAll('text.pie-slice').text(function (d) {
        if (((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) !== 0 && Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) >= 3) {
            return dc.utils.printSingleValue(d.data.key + ' (' + Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100)) + '%)';
        }
    })
}

const ageGroups = ['60-100','50-59', '40-49', '30-39', '20-29', '0-19']
const effects = ['Improve', 'No effect', "Worsen"]
const MH = ["Anxiety", "Depression", "Insomnia", "OCD"]

const quantizeAge = (age) => {

    return ageGroups.find(e => {
        let s = e.split('-');
        return age >= s[0] && age <= s[1];
    })
}

/**
 * La fonction pour créer la visualisation
 */
async function createDataViz() {

    // On récupère le dataset et on le met dans la variable dataset
    let dataset = await d3.csv("/data/survey.csv");


    // On formate un peu la donnée pour nous éviter des soucis
    dataset.forEach((d) => {

        d["While working"] = d["While working"] === "Yes";
        d["Instrumentalist"] = d["Instrumentalist"] === "Yes" ? "Instrumentalist" : "Not Instrumentalist";
        d["Composer"] = d["Composer"] === "Yes" ? "Composer" : "Not Composer";
        d["Exploratory"] = d["Exploratory"] === "Yes";
        d["Foreign languages"] = d["Foreign languages"] === "Yes";
        // d["While working"] = d["While working"] === "Yes";

        d["Age"] = +d["Age"];
        d["Hours per day"] = +d["Hours per day"];
        d["BPM"] = +d["BPM"] <= 500 ? +d["BPM"] : 0;
        d["Anxiety"] = +d["Anxiety"];
        d["Depression"] = +d["Depression"];
        d["Insomnia"] = +d["Insomnia"];
        d["OCD"] = +d["OCD"];

        d["Timestamp"] = new Date(d["Timestamp"]);
        d["AgeGroup"] = quantizeAge(d["Age"])


        
    });

    
    // On crée le crossfilter que l'on va nommer ndx (une pseudo norme)
    const ndx = crossfilter(dataset);


    // =============== PIE GENRE ===============

    // On crée la dimension qui sera l'attention des médias (ou "Aucune information" si il n'y a pas d'info)
    const genreDimension = ndx.dimension(function (d) {
        return d["Fav genre"] || "Unknown";
    });

    const genreGroup = genreDimension.group().reduceCount();

    // const genrePieChart = new dc.PieChart('#chart1', groupName)
    //     .dimension(genreDimension)
    //     .group(genreGroup)
    //     .renderLabel(true)
    //     .renderTitle(true)
    //     .legend(dc.legend().highlightSelected(true).x(0).y(13))
    //     .title( function(d){return d.value})
    //     .on('pretransition', montrerPourcentagesPieChart)
    //     .height(300)
    //     .width(475)
    //     .innerRadius(100)

    const genreRowChart = new dc.RowChart('#chart1', groupName)
        .dimension(genreDimension)
        .group(genreGroup)
        .x(d3.scaleLinear().domain([6,20]))
        .elasticX(true)
        .width(550)
        .height(300)
        
 
    // =============== PIE AGE ===============

    const ageDimension = ndx.dimension(function (d) {
        return d["AgeGroup"] || "Unknown";
    });

    const ageGroup = ageDimension.group().reduceCount()

    const agePieChart = new dc.PieChart('#chart2', groupName)
        .dimension(ageDimension)
        .group(ageGroup)
        .renderLabel(true)
        .renderTitle(true)
        .legend(dc.legend().highlightSelected(true).x(0).y(13))
        .title( function(d){return d.value})
        .on('pretransition', montrerPourcentagesPieChart)
        .height(300)
        .width(475)
        .innerRadius(100)
        .ordinalColors(['#bec482','#90BE6D','#43AA8B', '#F9C74F','#F3722C',  '#F94144', ])
    
    // =============== BAR GENRE AGE ===============

   

    const ageGenreGroup = genreDimension.group().reduce( 
        function(p, v) {
            p[v.AgeGroup] = (p[v.AgeGroup] || 0) + 1;
            return p;}, 
          function(p, v) {
            p[v.AgeGroup] = (p[v.AgeGroup] || 0) - 1;
            return p;}, 
          function() {
            return {};
          }
    )

    function sel_stack (i) {
        return d => d.value[i];
    }



    const genreAgeChart = new dc.BarChart("#chart3", groupName)
    .dimension(genreDimension)
    .group(ageGenreGroup, ageGroups[0], sel_stack(ageGroups[0]))
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .width(650)
    .height(325)
    .legend(dc.legend().highlightSelected(true).x(0).y(13))
    .margins({left: 80, top: 0, right: 0, bottom: 20})
    .barPadding(0.3)
    .ordinalColors(['#F94144', '#F3722C', '#F9C74F', '#43AA8B','#bec482', '#9fc482'])
    .elasticY(true)
    


    for (var i = 1; i < ageGroups.length; ++i) {
        genreAgeChart.stack(ageGenreGroup, '' + ageGroups[i], sel_stack(ageGroups[i]));
    }
 


    // =============== NUMBER OF HOURS IMPROVEMENT ===============

    const hoursDimension = ndx.dimension(function (d) {
        return d["Hours per day"] || "Unknown";
    });

    const hoursGroup = hoursDimension.group().reduce( 
        function(p, v) {
            p[v["Music effects"]] = (p[v["Music effects"]] || 0) + 1;
            return p;}, 
          function(p, v) {
            p[v["Music effects"]] = (p[v["Music effects"]] || 0) - 1;
            return p;}, 
          function() {
            return {};
          }
    )


    const hoursImproveChart = new dc.BarChart("#chart4", groupName)
    .dimension(hoursDimension)
    .group(hoursGroup, effects[0], sel_stack(effects[0]))
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .width(650)
    .height(325)
    .legend(dc.legend().highlightSelected(true).x(0).y(13))
    .margins({left: 80, top: 0, right: 0, bottom: 40})
    .barPadding(0.3)
    .ordinalColors(['#90BE6D','#F9C74F','#F3722C'])
    .elasticY(true)
    .xAxisLabel("Hours per day")

    for (var i = 1; i < effects.length; ++i) {
        hoursImproveChart.stack(hoursGroup, '' + effects[i], sel_stack(effects[i]));
    }

    

    // =============== IMPORVEMENT INSTRUMENTALIST ===============

    const instr = [true, false]

    const effectDimension= ndx.dimension(function (d) {
        return d["Music effects"] || "Unknown";
    });

    const effectGroup = effectDimension.group().reduce( 
        function(p, v) {
            p[v["Instrumentalist"]] = (p[v["Instrumentalist"]] || 0) + 1;
            return p;}, 
          function(p, v) {
            p[v["Instrumentalist"]] = (p[v["Instrumentalist"]] || 0) - 1;
            return p;}, 
          function() {
            return {};
          }
          )

    const effectInstrumentalistChart = new dc.BarChart("#chart5", groupName)
    .dimension(effectDimension)
    .group(effectGroup, 'Instrumentalist', sel_stack('Instrumentalist'))
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .width(650)
    .height(325)
    .legend(dc.legend().highlightSelected(true).x(0).y(13))
    .margins({left: 80, top: 55, right: 0, bottom: 40})
    .barPadding(0.3)
    .elasticY(true)


    effectInstrumentalistChart.stack(effectGroup, '' + 'Not Instrumentalist', sel_stack('Not Instrumentalist'));

    // =============== IMPORVEMENT COMPOSER ===============

    const instDimension = ndx.dimension(function (d) {
        return [d["Instrumentalist"], d["Composer"]] ;
    });

    const instGroup = instDimension.group().reduceCount()

    const sunburstChart = new dc.SunburstChart("#chart8", groupName)
    .dimension(instDimension)
    .group(instGroup)
    .renderLabel(true)
    .renderTitle(true)
    .title( function(d){return d.value})
    .height(300)
    .width(500)
    .innerRadius(75)
    .legend(dc.legend())
    .on('pretransition', montrerPourcentagesPieChart)

    // =============== MH DISTRIBUTION ===============

    for(mh of MH){
        const mHDimension = ndx.dimension(function (d) {
            return d[mh] ;
        });
    
    const mHGroup = mHDimension.group().reduceCount()

    console.log("#chart-" + mh)
    const mHBarChart = new dc.BarChart("#chart-" + mh, groupName)
        .dimension(mHDimension)
        .group(mHGroup)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .width(250)
        .xAxisLabel("Note")
    }

    // =============== MH BPM ===============

    for(mh of MH){

        const mHBPMDimension = ndx.dimension(function (d) {
            return [d[mh]] ;
        });
    
        const mHBPMGroup = mHBPMDimension.group().reduce(
            function(p,v) {
                // keep array sorted for efficiency
                p.splice(d3.bisectLeft(p, v["BPM"]), 0, v["BPM"]);
                return p;
              },
              function(p,v) {
                p.splice(d3.bisectLeft(p, v["BPM"]), 1);
                return p;
              },
              function() {
                return [];
              }
        )
    
        const mHBPMScatter = new dc.BoxPlot("#chart-"+mh+"2", groupName)
            .dimension(mHBPMDimension)
            .group(mHBPMGroup.orderNatural())
            .width(525)
            .elasticY(true)
            .ordering(function(d) { return d.key[0]; })
            .xAxisLabel("Note")
            

        console.log(mHBPMGroup.all())
    }

   

    // On veut rendre tous les graphiques qui proviennent du chart group "dataset"
    dc.renderAll(groupName);



}