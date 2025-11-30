// Chart dimensions (simpler approach)
const chartWidth = 1200;   // Total width
const chartHeight = 600;   // Total height
const padding = 60;        // Space around chart

// Calculate drawing area
const width = chartWidth - padding * 2;
const height = chartHeight - padding * 2;

// Severity colors
const colors = {
    'Slight': '#3498db', 
    'Serious': '#f39c12',  
    'Fatal': '#e74c3c'  
};


// Create SVG canvas
const svg = d3.select('#chart')
    .append('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .append('g')
    .attr('transform', `translate(${padding}, ${padding})`);

// Tooltip element
const tooltip = d3.select('#tooltip');

// Load CSV data
d3.csv('data/complete_datasets.csv').then(data => {

    // Count total casualties and collisions
    const totalCasualties = data.length;
    const collisionIDs = new Set(data.map(d => d.collision_index));
    const totalCollisions = collisionIDs.size;

    // Display totals
    d3.select('#total-casualties').text(totalCasualties.toLocaleString());
    d3.select('#total-collisions').text(totalCollisions.toLocaleString());

    // Step 1: Process data - count casualties by hour and severity
    const hourlyData = [];
    
    // Initialize 24 hours with zero counts
    for (let h = 0; h < 24; h++) {
        hourlyData[h] = { hour: h, Slight: 0, Serious: 0, Fatal: 0 };
    }
    
    // Count each casualty
    data.forEach(row => {
        const hour = parseInt(row.time.split(':')[0]);
        const severity = row.casualty_severity;
        
        if (severity === '3') hourlyData[hour].Slight++;
        if (severity === '2') hourlyData[hour].Serious++;
        if (severity === '1') hourlyData[hour].Fatal++;
    }


);



    

    // Step 2: Update summary cards
    const totals = {
        Slight: d3.sum(hourlyData, d => d.Slight),
        Serious: d3.sum(hourlyData, d => d.Serious),
        Fatal: d3.sum(hourlyData, d => d.Fatal)
    };
    
    d3.select('#slight-count').text(totals.Slight.toLocaleString());
    d3.select('#serious-count').text(totals.Serious.toLocaleString());
    d3.select('#fatal-count').text(totals.Fatal.toLocaleString());

    // Step 3: Create scales
    // X scale for hours (0-23)
    const xScale = d3.scaleBand()
        .domain(d3.range(24))
        .range([0, width])
        .padding(0.2);

    // X scale for severity groups within each hour
    const xSubScale = d3.scaleBand()
        .domain(['Slight', 'Serious', 'Fatal'])
        .range([0, xScale.bandwidth()])
        .padding(0.05);

    // Y scale for casualty counts
    const maxCount = d3.max(hourlyData, d => Math.max(d.Slight, d.Serious, d.Fatal));
    const yScale = d3.scaleLinear()
        .domain([0, maxCount])
        .nice()
        .range([height, 0]);

    // Step 4: Draw grid lines
    svg.selectAll('.grid-line')
        .data(yScale.ticks(10))
        .join('line')
        .attr('class', 'grid-line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d));

    // Step 5: Draw axes
    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .call(d3.axisLeft(yScale));

    // Axis labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-label')
        .text('Hour of Day');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-label')
        .text('Number of Casualties');

    // Step 6: Draw bars
    const severities = ['Slight', 'Serious', 'Fatal'];
    
    // Create a group for each hour
    const hourGroups = svg.selectAll('.hour-group')
        .data(hourlyData)
        .join('g')
        .attr('transform', d => `translate(${xScale(d.hour)}, 0)`);

    // Draw 3 bars per hour (one for each severity)
    severities.forEach(severity => {
        hourGroups.append('rect')
            .attr('x', xSubScale(severity))
            .attr('width', xSubScale.bandwidth())
            .attr('y', height)
            .attr('height', 0)
            .attr('fill', colors[severity])
            .on('mouseover', function(event, d) {
                // Highlight bar
                d3.select(this).style('opacity', 0.8);
                
                // Show tooltip
                tooltip.classed('show', true)
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 15) + 'px');
                
                tooltip.select('.hour').text(`Hour: ${d.hour}`);
                tooltip.select('.severity').text(severity).style('color', colors[severity]);
                tooltip.select('.count').text(`${d[severity]} casualties`);
            })
            .on('mouseout', function() {
                // Remove highlight
                d3.select(this).style('opacity', 1);
                
                // Hide tooltip
                tooltip.classed('show', false);
            })
            // Animate bars growing from bottom
            .transition()
            .duration(800)
            .delay((d, i) => i * 30)
            .attr('y', d => yScale(d[severity]))
            .attr('height', d => height - yScale(d[severity]));
    });

}).catch(error => {
    alert('Error loading data!');
});
