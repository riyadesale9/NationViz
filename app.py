import streamlit as st
import json
from src.data_processing import load_mobile_data, load_gdp_data, load_population_data, load_freight_data, load_passenger_data, load_electricity_data, load_disclosure_data, load_childrens_data, load_expenditure_data, load_difference_data, load_diplomacy_data, load_trade_data, load_tourism_data


with open("node_modules/d3/dist/d3.min.js") as d3_file:
    d3_script = d3_file.read()

st.set_page_config(layout="wide", page_title="Countries Dashboard")

# Streamlit app layout and title
st.markdown(
    """
    <style>
    .title {
        text-align: center;
        margin-bottom: 50px;
        font-size: 32px;
        background-color: #c6dfff;
        height: 70px;
        font-weight: bold;
    }
    </style>
    """,
    unsafe_allow_html=True
)

st.markdown('<h1 class="title">Decade of Transformation</h1>', unsafe_allow_html=True)

# Load mobile data and GDP data for existing charts
mobile_data = load_mobile_data()
gdp_data = load_gdp_data()

# Load D3.js code for line chart and pie chart
with open('static/js/multiline_chart.js', 'r') as file:
    line_chart_code = file.read()

with open('static/js/pie_chart.js', 'r') as file:
    pie_chart_code = file.read()

# First row of charts (GDP Pie Chart and Mobile Subscriptions Line Chart)
col1, col2 = st.columns(2)

with col1:
    st.subheader('GDP per Capita (2020)')
    
    gdp_countries = st.multiselect(
        'Select countries for GDP comparison',
        options=gdp_data['Country'].unique(),
        default=gdp_data['Country'].unique()[:5]
    )
    
    filtered_gdp_data = gdp_data[gdp_data['Country'].isin(gdp_countries)]
    
    gdp_data_json = json.dumps(filtered_gdp_data.to_dict(orient='records'))
    
    st.components.v1.html(f"""
        <div id="pie-chart" style="width:100%;"></div>
        <script>{d3_script}</script>
        <script>
        const gdpData = {gdp_data_json};
        {pie_chart_code}
        </script>
    """, height=550)

with col2:
    st.subheader('Technology Adaption (2010-2020)')
    
    countries = st.multiselect(
        'Select countries for mobile subscriptions',
        options=mobile_data['Country'].unique(),
        default=mobile_data['Country'].unique()[:5]
    )
    
    filtered_mobile_data = mobile_data[mobile_data['Country'].isin(countries)]
    
    mobile_data_json = json.dumps(filtered_mobile_data.to_dict(orient='records'))
    
    st.components.v1.html(f"""
        <div id="line-chart" style="width:100%;"></div>
        <script>{d3_script}</script>
        <script>
        const mobileData = {mobile_data_json};
        {line_chart_code}
        </script>
    """, height=550)

# Add Choropleth Map with Slider for Year Selection

st.subheader('Population in 2020 (thousands)')
population_data = load_population_data()

population_data_json = json.dumps(population_data.to_dict(orient='records'))

# Load D3.js code for choropleth map
with open('static/js/choropleth_map.js', 'r') as file:
    choropleth_map_code = file.read()

st.components.v1.html(f"""
<div id="choropleth-map" style="width:100%;"></div>
<script>{d3_script}</script>
<script>
const populationData = {population_data_json};
{choropleth_map_code}
</script>
""", height=600)

st.subheader('Air transport in 2020 - Freight (million ton-km)')
# Load freight data for selected countries (India, Russia, China, Canada & US)
freight_data = load_freight_data()

# Convert data to JSON format for D3.js consumption
freight_data_json = json.dumps(freight_data.to_dict(orient='records'))


with open('static/js/symbol_map.js', 'r') as file:
    symbol_map_code = file.read()

st.components.v1.html(f"""
<div id="symbol-map" style="width:100%;"></div>
<script>{d3_script}</script>
<script>
const freightData = {freight_data_json};
{symbol_map_code}
</script>
""", height=600)

st.subheader('Air transport in 2020 - Passengers')
st.markdown("This dot map resprsents p[assenger carried by air transport in 2020. Each dot represents 100000 passengers.")

# Load passenger data for selected countries (India, Russia, China, Canada & US)
passenger_data = load_passenger_data()

# Convert data to JSON format for D3.js consumption
passenger_data_json = json.dumps(passenger_data.to_dict(orient='records'))

# Load D3.js code for dot map
with open('static/js/dot_map.js', 'r') as file:
    dot_map_code = file.read()

# Display the dot map with no slider (fixed on year 2021)
st.components.v1.html(f"""
<div id="dot-map" style="width:100%;"></div>
<script>{d3_script}</script>
<script>
const passengerData = {passenger_data_json};
{dot_map_code}
</script>
""", height=600)


# Load electricity data for selected countries
electricity_data = load_electricity_data()
disclosure_data = load_disclosure_data()


# Display the stacked bar chart in col3 with col4 as an empty column.
col3, col4 = st.columns(2)

with col3:
    st.subheader('Electricity Production')
    # Year filter for selecting the year
    selected_year = st.selectbox('Select Year', ['2021', '2020', '2019', '2018'])

    # Filter data based on selected year and prepare it for D3.js consumption
    filtered_electricity_data = electricity_data[['Country', f'{selected_year}_solar', f'{selected_year}_thermal', f'{selected_year}_wind', f'{selected_year}_nuclear']]
    filtered_electricity_data.columns = ['Country', 'solar', 'thermal', 'wind', 'nuclear']

    # Convert data to JSON format for D3.js consumption
    electricity_data_json = json.dumps(filtered_electricity_data.to_dict(orient='records'))
    with open('static/js/bar_chart.js', 'r') as file:
        stacked_bar_chart_code = file.read()

    st.components.v1.html(f"""
    <div id="stacked-bar-chart" style="width:100%;"></div>
    <script>{d3_script}</script>
    <script>
    const electricityDataJson = JSON.stringify({electricity_data_json});
    {stacked_bar_chart_code}
    </script>
    """, height=600)
 
with col4:
    st.subheader('Business Extent of Disclosure Relativeness')
    st.markdown("This chord diagram illustrates the relationships between countries based on difference between their disclosure values. Thinner chords represent closeness.")
    year = st.slider('Select Year', min_value=2005, max_value=2019, value=2015)
    filtered_disclosure_data = disclosure_data[disclosure_data['Year'] == year]
    disclosure_data_json = json.dumps(filtered_disclosure_data.to_dict(orient='records'))
    
    st.components.v1.html(f"""
    <div id="chord-diagram" style="width: 100%;"></div>
    <script>{d3_script}</script> 
    <script>
    const disclosureData = {disclosure_data_json};
    {open('static/js/chord_diagram.js').read()}
    </script>
    """, height=600)


# Load children's data
childrens_data = load_childrens_data()

# Convert data to JSON format for D3.js consumption
childrens_data_json = json.dumps(childrens_data.to_dict(orient='records'))
with open('static/js/parallel_coordinates_chart.js', 'r') as file:
        parallel_coordinates_chart_code = file.read()

# Display the parallel coordinates chart in col5 with col6 as an empty column.
col5, col6 = st.columns(2)

with col5:
    st.subheader('State of Children in 2020')
    st.components.v1.html(f"""
    <div id="parallel-coordinates-chart" style="width:100%;"></div>
    <script>{d3_script}</script>
    <script>
    const childrensDataJson = JSON.stringify({childrens_data_json});
    {parallel_coordinates_chart_code}
    </script>
    """, height=600)

# Load expenditure data for selected countries
expenditure_data = load_expenditure_data()

# Convert data to JSON format for D3.js consumption
expenditure_data_json = json.dumps(expenditure_data.to_dict(orient='records'))

with open('static/js/sunburst_chart.js', 'r') as file:
        sunburst_chart_code = file.read()

with col6:
    st.subheader('Expenditure as percent of GDP')
    st.components.v1.html(f"""
    <div id="sunburst-chart" style="width:100%;"></div>
    <script>{d3_script}</script>
    <script>
    const expenditureDataJson = JSON.stringify({expenditure_data_json});
    {sunburst_chart_code}
    </script>
    """, height=600)

st.subheader('Diplomatic Relations')

# Load diplomacy data for selected countries
diplomacy_data = load_diplomacy_data()

# Convert data to JSON format for D3.js consumption
diplomacy_data_json = json.dumps(diplomacy_data)

# Load D3.js code for force-directed graph
with open('static/js/force_directed_graph.js', 'r') as file:
    force_directed_graph_code = file.read()

# Display the force-directed graph in col11 with col12 as an empty column.
  
st.components.v1.html(f"""
<div id="force-directed-graph" style="width:100%;"></div>
<script>{d3_script}</script>
<script>
const diplomacyDataJson = JSON.stringify({diplomacy_data_json});
{force_directed_graph_code}
</script>
""", height=600)

# Load difference data for selected countries
difference_data = load_difference_data()

# Convert data to JSON format for D3.js consumption
difference_data_json = json.dumps(difference_data.to_dict(orient='records'))



# Display the difference chart in col9 with col10 as an empty column.
col7, col8 = st.columns(2)

with col7:
    st.subheader('Yearly Change in Life Expectancy & Healthcare Expense')
    # Country filter for selecting a country
    selected_country = st.selectbox('Select Country', difference_data['Country'].unique())

    # Load D3.js code for difference chart
    with open('static/js/difference_chart.js', 'r') as file:
        difference_chart_code = file.read()
    st.components.v1.html(f"""
    <div id="difference-chart" style="width:100%;"></div>
    <script>{d3_script}</script>
    <script>
    const differenceDataJson = JSON.stringify({difference_data_json});
    {difference_chart_code}
    drawDifferenceChart('{selected_country}');
    </script>
    """, height=600)



trade_data = load_trade_data()


# Load D3.js code for treemap chart
with open('static/js/treemap.js', 'r') as file:
    treemap_code = file.read()

with col8:
    st.subheader('Commodity Trade in US Dollars')
    # Slider for selecting year
    year = st.slider('Select Year', min_value=2011, max_value=2020, value=2020)

    # Filter data for selected year
    filtered_trade_data = trade_data[trade_data['Year'] == year]

    # Convert filtered data to JSON format for D3.js consumption
    trade_data_json = json.dumps(filtered_trade_data.to_dict(orient='records'))

    st.components.v1.html(f"""
    <div id="treemap" style="width:100%;"></div>
    
    <script>{d3_script}</script>
    <script>
    const tradeData = {trade_data_json};
    {treemap_code}
    </script>
    """, height=600)
def build_hierarchy(data):
    hierarchy = {"name": "World Tourism", "children": []}
    countries = data['Country'].unique()
    for country in countries:
        country_data = data[data['Country'] == country]
        country_node = {"name": country, "children": []}
        regions = country_data['Region'].unique()
        for region in regions:
            region_data = country_data[country_data['Region'] == region]
            region_node = {"name": region, "children": []}
            tourism_types = region_data['Tourism Type'].unique()
            for tourism_type in tourism_types:
                tourism_value = region_data[region_data['Tourism Type'] == tourism_type]['Tourist Revenue (billion USD)'].values[0]
                tourism_node = {"name": tourism_type, "value": float(tourism_value)}
                region_node["children"].append(tourism_node)
            country_node["children"].append(region_node)
        hierarchy["children"].append(country_node)
    return hierarchy

# Load tourism data for selected countries and regions
tourism_data = load_tourism_data()
tourism_hierarchy = build_hierarchy(tourism_data)
tourism_json = json.dumps(tourism_hierarchy)
# Convert data to JSON format for D3.js consumption
#tourism_data_json = json.dumps(tourism_data.to_dict(orient='records'))

# Load D3.js code for circle packing chart
with open('static/js/circle_packing.js', 'r') as file:
    circle_packing_code = file.read()

# Display the zoomable circle packing chart in col15 with col16 as an empty column.
#col10, col11 = st.columns(2)
    st.subheader('Tourism Revenue in Million dollars(2020)')
    st.markdown("This zoomable circle packing diagram illustrates tourism revenue of countries along with states. It also gives information about inbound, outbound & domestic tourism")
    st.components.v1.html(f"""
    <div id="circle-packing" style="width:100%; display: flex;
  justify-content: center;
  align-items: center;"></div>
    <script>{d3_script}</script>
    <script>
    const data = {tourism_json};
    {circle_packing_code}
    </script>
    """, height=600)