// Chart dimensions (simpler approach)
const chartWidth = 800;    // Total width
const chartHeight = 600;   // Total height
const padding = 60;        // Space around chart
const leftPadding = 200;   // Extra space for labels

// Calculate drawing area
const width = chartWidth - leftPadding - padding;
const height = chartHeight - padding * 2;

// Weather condition colors (1-9)
const colors = {
    '1': '#3498db',   // Fine 
    '2': '#95a5a6',   // Raining 
    '3': '#ecf0f1',   // Snowing 
    '4': '#5dade2',   // Fine + high winds
    '5': '#7f8c8d',   // Raining + high winds
    '6': '#d5dbdb',   // Snowing + high winds
    '7': '#34495e',   // Fog or mist
    '8': '#e67e22',   // Other
    '9': '#95a5a6'    // Unknown
};

const weatherLabels = {
    '1': 'Fine ',
    '2': 'Raining ',
    '3': 'Snowing ',
    '4': 'Fine + high winds',
    '5': 'Raining + high winds',
    '6': 'Snowing + high winds',
    '7': 'Fog or mist',
    '8': 'Other',
    '9': 'Unknown'
};


// Create SVG canvas
const svg = d3.select('#chart')
    .append('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .append('g')
    .attr('transform', `translate(${leftPadding}, ${padding})`);

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

    // Step 1: Count casualties per weather condition and track severity
    const weatherCount = {};
    
    data.forEach(row => {
        const weather = row.weather_conditions;
        const severity = row.casualty_severity;
        
        // Count every casualty
        if (!weatherCount[weather]) {
            weatherCount[weather] = { total: 0, severities: new Set() };
        }
        weatherCount[weather].total++;
        weatherCount[weather].severities.add(severity);
    });
    
    // Step 2: Convert to array for D3
    const weatherData = Object.keys(weatherCount).map(key => ({
        weather: key,
        count: weatherCount[key].total,
        label: weatherLabels[key],
        severities: weatherCount[key].severities
    })).sort((a, b) => a.weather - b.weather);
    
    // Create filtered data function
    function getFilteredData(selectedSeverities) {
        const filteredCount = {};
        
        data.forEach(row => {
            const weather = row.weather_conditions;
            const severity = row.casualty_severity;
            
            if (selectedSeverities.has(severity)) {
                if (!filteredCount[weather]) {
                    filteredCount[weather] = 0;
                }
                filteredCount[weather]++;
            }
        });
        
        return Object.keys(weatherCount).map(key => ({
            weather: key,
            count: filteredCount[key] || 0,
            label: weatherLabels[key]
        })).sort((a, b) => a.weather - b.weather);
    }

    // Step 3: Create scales
    // Y scale for weather conditions (use labels instead of numbers)
    const yScale = d3.scaleBand()
        .domain(weatherData.map(d => d.label))
        .range([0, height])
        .padding(0.2);

    // X scale for casualty counts
    const maxCount = d3.max(weatherData, d => d.count);
    const xScale = d3.scaleLinear()
        .domain([0, maxCount])
        .nice()
        .range([0, width]);
    
    // Function to update chart
    function updateChart(newData) {
        const newMaxCount = d3.max(newData, d => d.count);
        xScale.domain([0, newMaxCount]).nice();
        
        // Update total casualties count based on filtered data
        const totalFilteredCasualties = d3.sum(newData, d => d.count);
        d3.select('#total-casualties').text(totalFilteredCasualties.toLocaleString());
        
        // Update total collisions count based on filtered data
        const selectedSeverities = new Set();
        severityCheckboxes.forEach(cb => {
            if (cb.checked) selectedSeverities.add(cb.value);
        });
        
        const filteredCollisions = new Set();
        data.forEach(row => {
            if (selectedSeverities.has(row.casualty_severity)) {
                filteredCollisions.add(row.collision_index);
            }
        });
        d3.select('#total-collisions').text(filteredCollisions.size.toLocaleString());
        
        // Update bars
        svg.selectAll('.bar')
            .data(newData)
            .transition()
            .duration(500)
            .attr('width', d => xScale(d.count))
            .style('opacity', d => d.count === 0 ? 0 : 1);
        
        // Update labels - hide when count is 0, position outside bars
        svg.selectAll('.bar-label')
            .data(newData)
            .transition()
            .duration(500)
            .attr('x', d => xScale(d.count) + 5)
            .attr('text-anchor', 'start')
            .style('fill', '#2c3e50')
            .text(d => d.count === 0 ? '' : d.count.toLocaleString())
            .style('opacity', d => d.count === 0 ? 0 : 1);
        
        // Update x-axis
        svg.select('.x-axis')
            .transition()
            .duration(500)
            .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(',d')));
        
        // Update grid lines
        svg.selectAll('.grid-line')
            .data(xScale.ticks(10))
            .join('line')
            .attr('class', 'grid-line')
            .transition()
            .duration(500)
            .attr('x1', d => xScale(d))
            .attr('x2', d => xScale(d))
            .attr('y1', 0)
            .attr('y2', height);
    }

    // Step 4: Draw grid lines
    svg.selectAll('.grid-line')
        .data(xScale.ticks(10))
        .join('line')
        .attr('class', 'grid-line')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 0)
        .attr('y2', height);

    // Step 5: Draw axes
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(',d')));

    svg.append('g')
        .call(d3.axisLeft(yScale));

    // Step 6: Draw bars
    svg.selectAll('.bar')
        .data(weatherData)
        .join('rect')
        .attr('class', d => `bar bar-${d.weather}`)
        .attr('x', 0)
        .attr('y', d => yScale(d.label))
        .attr('width', 0)
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colors[d.weather])
        .on('mouseover', function(event, d) {
            // Highlight bar
            d3.select(this).style('opacity', 0.8);
            
            // Show tooltip
            tooltip.classed('show', true)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 15) + 'px');
            
            tooltip.select('.weather_cond').text(`${d.label}`);
            tooltip.select('.severity').text('').style('color', colors[d.weather]);
            tooltip.select('.count').text(`${d.count.toLocaleString()} casualties`);
        })
        .on('mouseout', function() {
            // Remove highlight
            d3.select(this).style('opacity', 1);
            
            // Hide tooltip
            tooltip.classed('show', false);
        })
        // Animate bars growing from left
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr('width', d => xScale(d.count));
    
    // Add value labels on bars
    svg.selectAll('.bar-label')
        .data(weatherData)
        .join('text')
        .attr('class', d => `bar-label bar-label-${d.weather}`)
        .attr('x', 0)
        .attr('y', d => yScale(d.label) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('dx', '8')
        .style('fill', '#2c3e50')
        .style('font-weight', 'bold')
        .style('font-size', '14px')
        .style('pointer-events', 'none')
        .text(d => d.count.toLocaleString())
        .style('opacity', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .style('opacity', 1)
        .attr('x', d => xScale(d.count) + 5)
        .attr('text-anchor', 'start');

    // Filter functionality
    const severityCheckboxes = document.querySelectorAll('.severity-filter');
    const selectAllCheckbox = document.getElementById('select-all');

    // Handle individual checkbox changes
    severityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Get selected severities
            const selectedSeverities = new Set();
            severityCheckboxes.forEach(cb => {
                if (cb.checked) selectedSeverities.add(cb.value);
            });
            
            // Update chart with filtered data
            const filteredData = getFilteredData(selectedSeverities);
            updateChart(filteredData);

            
            // Update select all checkbox
            const allChecked = Array.from(severityCheckboxes).every(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
        });
    });

    // Handle select all checkbox
    selectAllCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        
        severityCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        
        // Get selected severities
        const selectedSeverities = new Set();
        if (isChecked) {
            severityCheckboxes.forEach(cb => selectedSeverities.add(cb.value));
        }
        
        // Update chart with filtered data
        const filteredData = getFilteredData(selectedSeverities);
        updateChart(filteredData);
    });

}).catch(error => {
    alert('Error loading data!');
});
