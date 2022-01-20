const plot_width = 800;
const plot_height = 600;
const padding = 100;
var svg;

var xScale;
var yScale;

var year;
var region;
var xAttribute;
var yAttribute;
var xAxis_Label;
var yAxis_Label;

var countryData;
var population_women_0to4;
var population_men_0to4;
var population_women_10to14;
var population_men_10to14;
var population_women_15to19;
var population_men_15to19;

var timer;
var year_changing = false;
var changed_year = 1970;
var button_input1 = "";

var country_cat = {};
var country_geo = {};

var country_population_men_0to4 = {}
var country_population_women_0to4 = {}
var country_population_men_10to14 = {}
var country_population_women_10to14 = {}
var country_population_men_15to19 = {}
var country_population_women_15to19 = {}

var max_population_men_0to4 = 0;
var max_population_women_0to4 = 0;
var max_population_men_10to14 = 0;
var max_population_women_10to14 = 0;
var max_population_men_15to19 = 0;
var max_population_women_15to19 = 0;



document.addEventListener('DOMContentLoaded', function() {

  Promise.all([d3.csv('data/countries_regions.csv'),
               d3.csv('data/population_aged_0_4_years_male_percent.csv'),
               d3.csv('data/population_aged_0_4_years_female_percent.csv'),
               d3.csv('data/population_aged_10_14_years_male_percent.csv'),
               d3.csv('data/population_aged_10_14_years_female_percent.csv'),
               d3.csv('data/population_aged_15_19_years_male_percent.csv'),
               d3.csv('data/population_aged_15_19_years_female_percent.csv')])
          .then(function(values){
            countryData = values[0];
            population_men_0to4 = values[1];
            population_women_0to4 = values[2];
            population_men_10to14 = values[3];
            population_women_10to14 = values[4];
            population_men_15to19 = values[5];
            population_women_15to19 = values[6];

          console.log("Code started.");

          for (var i = 0; i < countryData.length; i++) {

            if( !(countryData[i].Worldbankregion in country_cat)){

              country_cat[countryData[i].Worldbankregion] = [];
              country_cat[countryData[i].Worldbankregion].push(countryData[i].name);

              if(!(countryData[i].name in country_geo)){
                country_geo[countryData[i].name] = countryData[i].geo;
              }
            }
            else{
              country_cat[countryData[i].Worldbankregion].push(countryData[i].name);
              if(!(countryData[i].name in country_geo)){
                country_geo[countryData[i].name] = countryData[i].geo;
              }
            }
          }

          country_population_men_0to4 = create_data_for_attributes(population_men_0to4);
          country_population_women_0to4 = create_data_for_attributes(population_women_0to4);
          country_population_men_10to14 = create_data_for_attributes(population_men_10to14);
          country_population_women_10to14 = create_data_for_attributes(population_women_10to14);
          country_population_men_15to19 = create_data_for_attributes(population_men_15to19);
          country_population_women_15to19 = create_data_for_attributes(population_women_15to19);

          max_population_men_0to4 = max_value(country_population_men_0to4);
          max_population_women_0to4 = max_value(country_population_women_0to4);
          max_population_men_10to14 = max_value(country_population_men_10to14);
          max_population_women_10to14 = max_value(country_population_women_10to14);
          max_population_men_15to19 = max_value(country_population_men_15to19);
          max_population_women_15to19 = max_value(country_population_women_15to19);

          year = d3.select('#year-input').property("value");

          region = d3.select('#region').property("value");

          xAttribute = d3.select('#x-attribute').property("value");
          
          yAttribute = d3.select('#y-attribute').property("value");

          drawScatterPlot(year, region, xAttribute, yAttribute);
  })

});

function create_data_for_attributes(input_data){
  output = {}
  for (var i = 0; i < input_data.length; i++) {
    if(!(input_data[i].country in output)){
      output[input_data[i].country] = {};
    }
    var obj = input_data[i];
    for(var key in obj){
      if(key!='country'){
        output[input_data[i].country][key] = +obj[key];
      }
    }
  }
  return output;
}

function max_value(data_dict){
  var temp = [];
  for( var key in data_dict){
    var temp_array = Object.values(data_dict[key]);
    temp.push(Math.max(...temp_array));
  }
  return Math.max(...temp); 
}


function get_attribute_data(value){
  if( value == "population_men_0to4")
    return country_population_men_0to4;
  else if( value == "population_women_0to4")
    return country_population_women_0to4;
  else if( value == "population_men_10to14")
    return country_population_men_10to14;
  else if( value == "population_women_10to14")
    return country_population_women_10to14;
  else if( value == "population_men_15to19")
    return country_population_men_15to19;
  else if( value == "population_women_15to19")
    return country_population_women_15to19;
}

function get_scatterplot_finalvalue(x_attributeData_dict, y_attributeData_dict, countries_list){

  var result = []
  for(var i = 0;i < countries_list.length; i ++){
      if(x_attributeData_dict.hasOwnProperty(countries_list[i])){
        if(y_attributeData_dict.hasOwnProperty(countries_list[i]))
        {
          var x_tobj = x_attributeData_dict[countries_list[i]];
          var y_tobj = y_attributeData_dict[countries_list[i]];
          //console.log(tobj[year]);
          if (x_tobj.hasOwnProperty(year)) {
            if(y_tobj.hasOwnProperty(year)){
              result.push({'country':countries_list[i],'x':x_tobj[year], 'y':y_tobj[year], 'geo':country_geo[countries_list[i]]});
            }
            else{
              result.push({'country':countries_list[i],'x':x_tobj[year], 'y':0, 'geo':country_geo[countries_list[i]]});
            }
            
          }
          else{
            if(y_tobj.hasOwnProperty(year)){
              result.push({'country':countries_list[i],'x':0, 'y':y_tobj[year], 'geo':country_geo[countries_list[i]]});
            }
            else{
              result.push({'country':countries_list[i],'x':0, 'y':0, 'geo':country_geo[countries_list[i]]});
            }
          }
        }
        else{
          var x_tobj = x_attributeData_dict[countries_list[i]];
          if (x_tobj.hasOwnProperty(year)) {
            result.push({'country':countries_list[i],'x':x_tobj[year], 'y':0, 'geo':country_geo[countries_list[i]]});
          }
          else{
              result.push({'country':countries_list[i],'x':0, 'y':0, 'geo':country_geo[countries_list[i]]});
          }
        }
      }
      else{
        if(y_attributeData_dict.hasOwnProperty(countries_list[i])){
          if(y_tobj.hasOwnProperty(year)){
            result.push({'country':countries_list[i],'x':0, 'y':y_tobj[year], 'geo':country_geo[countries_list[i]]});
          }
          else{
            result.push({'country':countries_list[i],'x':0, 'y':0, 'geo':country_geo[countries_list[i]]});
          }
        }
      }
  }
  return result;
}

function set_color_bubble(region){
  if(region == "South Asia")
    return "green";
  else if(region == "Europe & Central Asia")
    return "red";
  else if(region == "Middle East & North Africa")
    return "blue";
  else if(region == "East Asia & Pacific")
    return "orange";
  else if(region == "Sub-Saharan Africa")
    return "yellow";
  else if(region == "Latin America & Caribbean")
    return "pink";
  else if(region == "North America")
    return "violet";
}

function get_max_attribute(value){
  if( value == "population_men_0to4")
    return max_population_men_0to4;
  else if( value == "population_women_0to4")
    return max_population_women_0to4;
  else if( value == "population_men_10to14")
    return max_population_men_10to14;
  else if( value == "population_women_10to14")
    return max_population_women_10to14;
  else if( value == "population_men_15to19")
    return max_population_men_15to19;
  else if( value == "population_women_15to19")
    return max_population_women_15to19;
}

function get_axis_label(value){
  if( value == "population_men_0to4")
    return "Male population percent in age groups 0-4";
  else if( value == "population_women_0to4")
    return "Female population percent in age groups 0-4";
  else if( value == "population_men_10to14")
    return "Male population percent in age groups 10-14"
  else if( value == "population_women_10to14")
    return "Female population percent in age groups 10-14";
  else if( value == "population_men_15to19")
    return "Male population percent in age groups 15-19";
  else if( value == "population_women_15to19")
    return "Female population percent in age groups 15-19";
}

function get_drawing_data() {

  var xAttr_data = get_attribute_data(xAttribute);
  var yAttr_data = get_attribute_data(yAttribute);

  var countries_list = country_cat[region];
  var result = get_scatterplot_finalvalue( xAttr_data, yAttr_data, countries_list);

  return result;

}

function step() {
  

  d3.select('#year-input').property('value',changed_year);
  console.log("Current Year :", changed_year);
  year = changed_year;

  svg.selectAll(".bg_year").remove();

  
  svg.append("text")
      .attr("class", "bg_year")
      .attr("text-anchor", "end")
      .text(year)
      .attr("opacity","0.3")
      .attr("font-size", "90px")
      .attr("fill", "gray")
      .attr("x", plot_width - 400)
      .attr("y", plot_height - 400);
      

  var xy_result = get_drawing_data();
  console.log("Updated xy_result : ", xy_result);

  var xScale = d3.scaleLinear()
                 .domain([0, get_max_attribute(xAttribute)])
                 .range([padding, plot_width - padding * 2]);

  // Creating y Scale
  var yScale = d3.scaleLinear()
                 .domain([0, get_max_attribute(yAttribute)])
                 .range([plot_height - padding, padding]);

  circle_transition(svg, xy_result, xScale, yScale);

  changed_year += 1
  if (changed_year > 2020) {
    year_changing = false;
    changed_year = 1970;
    clearInterval(timer);
    button_input1.text("Play");
  }
}


function circle_transition(svg, xy_result, xScale, yScale){

  var div = d3.select("body").append("div")
                             .attr("class", "tooltip")
                             .style("opacity", 0);

  var circle = svg.select("g")
                  .selectAll("circle")
                  .data(xy_result);
  circle.exit()
        .transition()
        .duration(500)
        .attr('r',0)
        .remove();

  circle.enter()
        .append("circle")
        .attr("r",0)
        .merge(circle)
        .on('mouseover', function(d) {
          console.log('mouseover on ' + d.country);

          div.transition()
             .duration(50)
             .style("opacity", 1);

          div.html("Country: " + d.country)
             .style("left", (d3.event.pageX + 10) + "px")
             .style("top", (d3.event.pageY + 15) + "px");

          })

        .on('mousemove',function(d) {
          console.log('mousemove on ' + d.country);

          div.html("Country: " + d.country)
             .style("left", (d3.event.pageX + 20) + "px")
             .style("top", (d3.event.pageY - 45) + "px");
                
          })

        .on('mouseout', function(d) {
          console.log('mouseout on ' + d.country);

          div.transition()
             .duration('50')
             .style("opacity", 0);

          })
        .transition()
        .duration(1000)
        .attr("cx", function (d) { return xScale(d.x); } )
        .attr("cy", function (d) { return yScale(d.y); } )
        .attr("r", 17)
        .attr("stroke", "#000000")
        .attr("stroke-width", 1)
        .style("fill", set_color_bubble(region));

  var circle_text = svg.selectAll(".dotLabel")
                       .data(xy_result);
    
  circle_text.exit()
             .transition()
             .duration(1000)
             .attr("opacity", 0)
             .remove();

  circle_text.enter()
             .append("text")
             .merge(circle_text)
             .text( function (d) { return d.geo; })
             .attr("class", "dotLabel")
             .transition()
             .duration(1000)
             .attr("x", function(d) { return xScale(d.x) - 9; })
             .attr("y", function(d) { return yScale(d.y) + 4; })
             .attr("font-family", "sans-serif")
             .attr("font-size", "15px")
             .attr("fill", "black");
}

function drawScatterPlot() {
  var plot_width = 800;
  var plot_height = 600;
  var padding = 100;

  
  xAxis_Label = get_axis_label(xAttribute);
  yAxis_Label = get_axis_label(yAttribute);



  var xy_result = get_drawing_data();



  var dots_color = set_color_bubble(region);

  svg = d3.select("#scatterplot")
              .attr("width", plot_width)
              .attr("height", plot_height);
  
  
  svg.selectAll('*').remove();

  var div = d3.select("body").append("div")
                               .attr("class", "tooltip")
                               .style("opacity", 0);


  var xScale = d3.scaleLinear()
                 .domain([0, get_max_attribute(xAttribute)])
                 .range([padding, plot_width - padding * 2]);

  var yScale = d3.scaleLinear()
                 .domain([0, get_max_attribute(yAttribute)])
                 .range([plot_height - padding, padding]);

  svg.append("text")
      .attr("class", "bg_year")
      .attr("text-anchor", "end")
      .attr("x", plot_width - 400)
      .attr("y", plot_height - 400)
      .text(year)
      .attr("opacity","0.2")
      .attr("font-size", "100px")
      .attr("fill", "black");

  svg.append("g")
     .selectAll("circle")
     .data(xy_result)
     .enter()
     .append("circle")
     .attr("cx", function (d) { return xScale(d.x); } )
     .attr("cy", function (d) { return yScale(d.y); } )
     .attr("r", 17)
     .attr("stroke", "#000000")
     .attr("stroke-width", 1)
     .style("fill", dots_color)

     .on('mouseover', function(d) {

        div.transition()
           .duration(50)
           .style("opacity", 1);

        div.html("Country: " + d.country)
           .style("left", (d3.event.pageX + 10) + "px")
           .style("top", (d3.event.pageY + 15) + "px");

        })

     .on('mousemove',function(d) {
        console.log('mousemove on ' + d.country);

        div.html("Country: " + d.country)
           .style("left", (d3.event.pageX + 20) + "px")
           .style("top", (d3.event.pageY - 45) + "px");
          
        })

     .on('mouseout', function(d) {
        console.log('mouseout on ' + d.country);

        div.transition()
           .duration('50')
           .style("opacity", 0);

        });

  svg.selectAll(".dotLabel")
     .data(xy_result)
     .enter()
     .append("text")
     .text( function (d) { return d.geo; })
     .attr("class", "dotLabel")
     .attr("x", function(d) { return xScale(d.x) - 9; })
     .attr("y", function(d) { return yScale(d.y) + 4; })
     .attr("font-family", "sans-serif")
     .attr("font-size", "15px")
     .attr("fill", "black");

  var x_axis = d3.axisBottom(xScale);

  svg.append("g")
      .attr("class", "x_axis")
      .attr("transform", "translate(0," + (plot_height - padding) +")")
      .call(x_axis);

  svg.append("text")
      .attr("class", "xAxis_label")
      .attr("text-anchor", "end")
      .attr("x", (plot_height - padding)/ 2 + 3 * padding)
      .attr("y", plot_height - padding + 50)
      .text(xAxis_Label);

  var y_axis = d3.axisLeft(yScale);

  svg.append("g")
      .attr("class", "y_axis")
      .attr("transform", "translate(" + padding +",0)")
      .call(y_axis);

  svg.append("text")
      .attr("class", "yAxis_label")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("x", -2 * padding + 90)
      .attr("y", padding - 50)
      .text(yAxis_Label);

  d3.select('#year-input')
    .on("change", function() {

      year = d3.select('#year-input').property("value");
    
      svg.selectAll(".bg_year").remove();

      svg.append("text")
          .attr("class", "bg_year")
          .attr("text-anchor", "end")
          .attr("x", plot_width - 400)
          .attr("y", plot_height - 400)
          .text(year)
          .attr("opacity","0.4")
          .attr("font-size", "100px")
          .attr("fill", "gray");

      
      var xy_result = get_drawing_data();
      console.log("Updated xy_result : ", xy_result);

      circle_transition(svg, xy_result, xScale, yScale);

    });


  d3.select('#x-attribute')
    .on("change", function() {

    
      xAttribute = d3.select('#x-attribute').property("value");
      

    
      xAxis_Label = get_axis_label(xAttribute);

      var xy_result = get_drawing_data();
      

    
      var xScale = d3.scaleLinear()
                     .domain([0, get_max_attribute(xAttribute)])
                     .range([padding, plot_width - padding * 2]);

      circle_transition(svg, xy_result, xScale, yScale);

    
      var x_axis = d3.axisBottom(xScale);

      svg.select(".x_axis")
         .transition()
         .duration(500)
         .call(x_axis);

      svg.select(".xAxis_label").remove();


      svg.append("text")
          .attr("class", "xAxis_label")
          .attr("text-anchor", "end")
          .attr("x", (plot_height - padding)/ 2 + 3 * padding)
          .attr("y", plot_height - padding + 50)
          .text(xAxis_Label);

    });


  d3.select('#y-attribute')
    .on("change", function() {

      yAttribute = d3.select('#y-attribute').property("value");
      yAxis_Label = get_axis_label(yAttribute);

      var xy_result = get_drawing_data();



      var yScale = d3.scaleLinear()
                     .domain([0, get_max_attribute(yAttribute)])
                     .range([plot_height - padding, padding]);

      circle_transition(svg, xy_result, xScale, yScale);      

      var y_axis = d3.axisLeft(yScale);

      svg.select(".y_axis")
         .transition()
         .duration(500)
         .call(y_axis);

      svg.select(".yAxis_label").remove();

      svg.append("text")
          .attr("class", "yAxis_label")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr("x", -2 * padding + 90)
          .attr("y", padding - 50)
          .text(yAxis_Label);

    });

  d3.select('#region')
    .on("change", function() {

      region = d3.select('#region').property("value");
   

      var xy_result = get_drawing_data();
     

      circle_transition(svg, xy_result, xScale, yScale);

    });

    d3.select("#play-input")
      .on("click", function() {

        var button_input = d3.select("#play-input");
        
        var button_input = d3.select(this);
        button_input1 = button_input;

        if (button_input.text() == "Pause") {
          year_changing = false;

          clearInterval(timer);
          button_input.text("Play");

        } else {
          year_changing = true;
          
          timer = setInterval(step, 1000);
          button_input.text("Pause");
          
        }
 
    });
}





