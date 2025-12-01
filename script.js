// Select tooltip
var tooltip = d3.select("#tooltip");

// Set up SVG and chart area
var svg = d3.select("svg");
var width = +svg.attr("width");
var height = +svg.attr("height");
var margin = {top: 20, right: 100, bottom: 40, left: 150};
var chartWidth = width - margin.left - margin.right;
var chartHeight = height - margin.top - margin.bottom;

var chart = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var severityLabels = {
  1: 'Fatal', 2: 'Serious', 3: 'Slight'
};


var weatherLabels = {
  '1': 'Fine',
  '2': 'Raining',
  '3': 'Snowing',
  '4': 'Fine + high winds',
  '5': 'Raining + high winds',
  '6': 'Snowing + high winds',
  '7': 'Fog / mist',
  '8': 'Other',
  '9': 'Unknown'
};





var colorScale = d3.scaleOrdinal()
  .domain(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
  .range(['red', 'blue', 'black', 'orange', 'grey', '#FFFFED', '#28A745', '#de2f41ff', '#6F42C1']);



// scale x
var x = d3.scaleLinear().range([0, chartWidth]);

// scale y

var y = d3.scaleBand().range([0, chartHeight]).padding(0.3);


// Casualties per weather condition

function countByWeather(data, severity) {
  var counts = {};
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var weather = row.weather_conditions;
    var caseSeverity = row.casualty_severity;
    //apply filter
    var severityToCheck = severity === 'all' ? 'all' : Number(severity);
    if (severityToCheck === 'all' || caseSeverity === severityToCheck) {
      if (!counts[weather]) {
        counts[weather] = 0;
      }
      counts[weather]++;
    }
  }
   // Convert to array
  var countWeatherArr = [];

  for (var code = 1; code <= 9; code++) {

    var key = String(code);
    
    if (counts[key]) {
      countWeatherArr.push({
        weather: key,
        label: weatherLabels[key],
        count: counts[key]
      });
    }
  }
  return countWeatherArr;
}

function updateCasualtyTable(data, severity) {
  // Filter data by severity
  var filtered = severity === "all" ?data:data.filter(function(d) { return d.casualty_severity === severity; });

  var uniqueCollisions = new Set(filtered.map(function(d) { return d.collision_index; }));
  var totalCollisions = uniqueCollisions.size;

  // Count total casualties
  var total = filtered.length;

  // Remove old table
  d3.select("#casualty-table").select("table").remove();

  // Build new table
  var table = d3.select("#casualty-table")
    .append("table")

  // Header
  var thead = table.append("thead").append("tr");
  thead.append("th")
    .text("Severity")
    .style("padding", "8px")
    .style("border", "1px solid #ccc")
    .style("background", "#f2f2f2")
    .style("font-weight", "bold");

    
  thead.append("th")
    .text("Total Casualties")
    .style("padding", "8px")
    .style("border", "1px solid #ccc")
    .style("background", "#f2f2f2")
    .style("font-weight", "bold");



  thead.append("th")
    .text("Total Collisions")
    .style("padding", "8px")
    .style("border", "1px solid #ccc")
    .style("background", "#f2f2f2")
    .style("font-weight", "bold");

  // Row
  var tbody = table.append("tbody").append("tr");
  tbody.append("td")
    .text(severity === "all" ? "All Severities" : severityLabels[severity])
    .style("padding", "8px")
    .style("border", "1px solid #ccc");
  tbody.append("td")
    .text(total.toLocaleString())
    .style("padding", "8px")
    .style("border", "1px solid #ccc");
  tbody.append("td")
    .text(totalCollisions.toLocaleString())
    .style("padding", "8px")
    .style("border", "1px solid #ccc");
}


// Func to draw and update chart
function updateChart(chartData) {
// Update scales
  y.domain(chartData.map(function(d) { return d.label; }));
  x.domain([0, d3.max(chartData, function(d) { return d.count; })]).nice();

  // Update bars with data join
  var bars = chart.selectAll("rect")
    .data(chartData, function(d) { return d.label; });

  // Remove old bars
  bars.exit()
    .transition()
    .duration(500)
    .attr("width", 0)
    .remove();

  // Update existing bars
  bars.transition()
    .duration(750)
    .attr("y", function(d) { return y(d.label); })
    .attr("width", function(d) { return x(d.count); })
    .attr("height", y.bandwidth())
    .attr("fill", function(d) { return colorScale(d.weather); });

  // Add new bars
  bars.enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function(d) { return y(d.label); })
    .attr("width", 0)
    .attr("height", y.bandwidth())
    .attr("fill", function(d) { return colorScale(d.weather); })
    .attr("rx", 3)
    .attr("ry", 3)
    .on("mouseover", function(event, d) {
      tooltip.style("visibility", "visible")
        .html("<strong>" + d.label + "</strong><br/>Casualties: " + d.count.toLocaleString());
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    })
    .transition()
    .duration(750)
    .attr("width", function(d) { return x(d.count); });

  // Update value labels with data join
  var labels = chart.selectAll(".value-label")
    .data(chartData, function(d) { return d.label; });

  // Remove old labels
  labels.exit()
    .transition()
    .duration(500)
    .style("opacity", 0)
    .remove();

  // Update existing labels
  labels.transition()
    .duration(750)
    .attr("x", function(d) { return x(d.count) + 5; })
    .attr("y", function(d) { return y(d.label) + y.bandwidth() / 2; })
    .text(function(d) { return d.count.toLocaleString(); });

  // Add new labels
  labels.enter()
    .append("text")
    .attr("class", "value-label")
    .attr("x", function(d) { return x(d.count) + 5; })
    .attr("y", function(d) { return y(d.label) + y.bandwidth() / 2; })
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .style("fill", "#2c3e50")
    .style("opacity", 0)
    .text(function(d) { return d.count.toLocaleString(); })
    .transition()
    .duration(750)
    .style("opacity", 1);

// Remove old elements
  chart.selectAll(".x-axis").remove();
  chart.selectAll(".y-axis").remove();
    
    

  // Draw axes
  chart.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(",d")))
    .append("text")                // add a text label
    .attr("class", "axis-title")
    .attr("x", chartWidth / 2)     
    .attr("y", 40)                 // push below 
    .attr("fill", "#000")
    .style("text-anchor", "middle")
    .style("font-size", "20px")    
    .style("font-weight", "bold")  
    .text("Number of Casualties"); 

  chart.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", -130)
    .attr("x", -chartHeight / 2)
    .attr("fill", "#000")
    .style("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Weather Conditions");
    chart.select(".y-axis")
    .selectAll("text:not(.axis-title)")
    .on("mouseover", function(event, d) {
      var dataPoint = chartData.find(function(item) { return item.label === d; });
      if (dataPoint) {
        tooltip.style("visibility", "visible")
          .html("<strong>" + dataPoint.label + "</strong><br/>Count: " + dataPoint.count.toLocaleString());
      }
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });

}

d3.csv("data/complete_datasets.csv").then(function(data) {
  
  //Convert casualty_severity to number
  data.forEach(function(d ) {
    d.casualty_severity = +d.casualty_severity;
    
  });

  // Print the fist 100 rows from dataset
  data.slice(0, 100).forEach(function(d, i) { console.log("Row " + i, d); });

  //Initial chart
  var initialData = countByWeather(data, 'all');
  updateChart(initialData);
  
  // Initial table
  updateCasualtyTable(data, "all");

  //Filter handler
  d3.select("#severityFilter").on("change", function() {
    var value = this.value;
    var level = value === "all" ? "all" : +value;

    
  // Update chart
    var filtered = countByWeather(data, value);
    updateChart(filtered);
    
  // Update table
    updateCasualtyTable(data, level);
  });
  
})
