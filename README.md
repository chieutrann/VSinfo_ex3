# InfoViz-25W-G1

## Author

Information Visualization Course - 2024/2025  
Assignment 3: D3 Implementation
Author: Tran Doan Chau
Last Updated: December 2024

## Project Overview

This project visualizes UK road traffic casualties by weather conditions using D3.js. The interactive horizontal bar chart displays casualty counts for different weather conditions with filtering capabilities by severity level (Fatal, Serious, Slight).

## Features
### Interactive Visualization
- Horizontal bar chart showing casualties by weather condition
- Color-coded bars for 9 different weather conditions
- Interactive tooltips displaying detailed information on hover
- Responsive design with clean, minimalist styling

### Animation Effects
- Bar transitions: Bars smoothly grow/shrink when filter changes (750ms duration)
- Enter animation: New bars start at width 0 and animate to full width
- Exit animation: Removed bars shrink to width 0 before disappearing (500ms)
- Label animations: Value labels fade in/out with opacity transitions
- Position updates: Bars smoothly move to new positions when data changes

### Data Filtering
- Filter by casualty severity: All Severities, Fatal, Serious, or Slight
- Real-time chart updates with smooth animations
- Dynamic value labels showing exact casualty counts

### Weather Conditions
The visualization tracks casualties across 9 weather conditions:
1. Fine
2. Raining
3. Snowing
4. Fine + high winds
5. Raining + high winds
6. Snowing + high winds
7. Fog / mist
8. Other
9. Unknown

## Technologies Used

- D3.js v7 - Data visualization library
- HTML5 - Structure
- CSS3 - Styling
- JavaScript - Functionality

## Data Source

UK Road Safety Data - 2024 casualty records including weather conditions, severity levels, and collision information.

## AI Assistance Disclosure

This project was developed with assistance from:
- GitHub Copilot: Code suggestions
- Claude: Design patterns and documentation

All AI-generated code was reviewed, tested, and customized for this assignment.

## References

- [D3.js Official Documentation](https://d3js.org/)
- [D3 Shape - Arcs](https://github.com/d3/d3-shape#arcs)
- [D3 Scale API](https://github.com/d3/d3-scale)
- [UK Road Safety Data](https://www.gov.uk/government/statistical-data-sets/road-safety-open-data)


