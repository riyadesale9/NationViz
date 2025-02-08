def get_chart_config(chart_type):
    if chart_type == 'multi_line':
        return {
            'width': 800,
            'height': 500,
            'margin': {'top': 20, 'right': 80, 'bottom': 30, 'left': 50},
            'xKey': 'Year',
            'yKey': 'Value',
            'colorKey': 'Country or Area'
        }
    # Add more configuration objects for other chart types as needed
