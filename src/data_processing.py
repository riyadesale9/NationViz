import pandas as pd

def load_mobile_data():
    df = pd.read_csv('data/mobile-subscriptions.csv')
    df = df[df['Year'].between(2010, 2020)]
    return df[['Country or Area', 'Year', 'Value']].rename(columns={'Country or Area': 'Country', 'Value': 'Subscriptions'})

def load_gdp_data():
    gdp_data = pd.read_csv('data/gdp_per_capita.csv')
    # Filter the data for year 2020
    gdp_data = gdp_data[gdp_data['Year'] == 2020]
    # Keep only the relevant columns
    gdp_data = gdp_data[['Country or Area', 'Value']]
    # Rename columns for easier access
    gdp_data.columns = ['Country', 'GDP']
    # Drop any rows with NaN values
    gdp_data = gdp_data.dropna()
    # Sort the data by GDP in descending order
    gdp_data = gdp_data.sort_values('GDP', ascending=False)
    return gdp_data

def load_population_data():
    # Load data from CSV file (adjust path as necessary)
    population_data = pd.read_csv('data/Population.csv')
    population_data = population_data[(population_data['Year(s)'] == 2020) & (population_data['Variant'] == 'Medium')]

    return population_data

def load_freight_data():
    # Load data from CSV file (adjust path as necessary)
    freight_data = pd.read_csv('data/freight.csv')

    relevant_countries = ['India', 'Russia', 'China', 'Canada', 'United States']

    # Filter data for only these countries in year 2021
    freight_data = freight_data[(freight_data['Country or Area'].isin(relevant_countries)) & (freight_data['Year'] == '2020')]

    return freight_data

def load_passenger_data():
    # Load data from CSV file (adjust path as necessary)
    passenger_data = pd.read_csv('data/passengers.csv')
    
    # Filter for only relevant countries and year 2021 with longitude/latitude included in CSV file.
    
    # Filter data for only these countries in year 2021:
    filtered_data = passenger_data[(passenger_data['Year'] == '2021')]
    
    return filtered_data
def load_electricity_data():
    # Load data from CSV file (adjust path as necessary)
    electricity_data = pd.read_csv('data/electricity.csv')
    
    # Pivot the data so that each type of electricity is a column
    electricity_data = electricity_data.pivot_table(
        index='Country',
        columns='Commodity - Transaction',
        values=['2018', '2019', '2020', '2021']
    ).reset_index()

    # Flatten multi-level columns
    electricity_data.columns = ['Country'] + [f'{year}_{col.split()[-2].lower()}' for year, col in electricity_data.columns[1:]]

    return electricity_data

def load_disclosure_data():
    df = pd.read_csv('data/disclosure_extent.csv')
    return df

def load_childrens_data():
    # Load data from CSV file
    childrens_data = pd.read_csv('data/Childrens_state.csv')
    
    # Clean and process data if necessary
    return childrens_data

def load_expenditure_data():
    # Load data from CSV file
    expenditure_data = pd.read_csv('data/expenditure.csv')
    
    # Clean and process data for sunburst chart
    # We will group by Country, Year, and Category and sum up the percentages of GDP
    expenditure_data_grouped = expenditure_data.groupby(['Country', 'Year', 'Category']).sum().reset_index()
    
    return expenditure_data_grouped


def load_difference_data():
    # Load data from CSV file
    data = pd.read_csv('data/difference.csv')

    # Convert columns to numeric
    data['Healthcare expenditure'] = pd.to_numeric(data['Healthcare expenditure'], errors='coerce')
    data['Life Expectency'] = pd.to_numeric(data['Life Expectency'], errors='coerce')

    # Sort data by Country and Year
    data.sort_values(by=['Country', 'Year'], inplace=True)

    # Create columns for year-over-year differences
    for country in data['Country'].unique():
        country_data = data[data['Country'] == country]
        # Calculate differences for healthcare expenditure and life expectancy
        data.loc[data['Country'] == country, 'Healthcare_diff'] = country_data['Healthcare expenditure'].diff().fillna(0)
        data.loc[data['Country'] == country, 'LifeExpectancy_diff'] = country_data['Life Expectency'].diff().fillna(0)

    # Save the prepared data to a new CSV or use it directly in your application
    prepared_data = data[['Country', 'Year', 'Healthcare_diff', 'LifeExpectancy_diff']]
    prepared_data.to_csv('prepared_difference_data.csv', index=False)
    return prepared_data


# def load_diplomacy_data():
#     # Load data from CSV file
#     diplomacy_data = pd.read_csv('data/Book2.csv')
    
#     # Correct column names
#     diplomacy_data.columns = [col.strip() for col in diplomacy_data.columns]
    
#     # Extract edges based on embassies
#     edges = []
#     for index, row in diplomacy_data.iterrows():
#         country = row['Country / Territory']
#         for col in diplomacy_data.columns[2:]:
#             if row[col] in ['Consulate-General']:
#                 edges.append({'source': country, 'target': col})

#     # Gather all unique countries as nodes
#     all_countries = set([edge['source'] for edge in edges] + [edge['target'] for edge in edges])
#     nodes = [{'name': country} for country in all_countries]

#     return {'nodes': nodes, 'edges': edges}

def load_diplomacy_data():
    # Load data from CSV file
    diplomacy_data = pd.read_csv('data/Book2.csv')
    
    # Correct column names
    diplomacy_data.columns = [col.strip() for col in diplomacy_data.columns]
    
    # Extract edges based on embassies
    edges = []
    for index, row in diplomacy_data.iterrows():
        city = row['City']

        for country in ['Canada', 'China', 'India', 'Russia', 'United States']:
            if row[country] in ['Embassy', 'Consulate-General', 'High Commission']:
                edges.append({'source': country, 'target': city})

    # Gather all unique countries and cities as nodes
    countries = [{'name': country, 'type': 'country'} for country in ['Canada', 'China', 'India', 'Russia', 'United States']]
    cities = [{'name': city, 'type': 'city'} for city in set(row['City'] for _, row in diplomacy_data.iterrows())]
    
    nodes = countries + cities
    return {'nodes': nodes, 'edges': edges}

def load_trade_data():
    # Load data from CSV file
    trade_data = pd.read_csv('data/Trade.csv')
    
    # Clean and process data for the treemap
    # Convert 'Trade (USD)' to numeric
    trade_data['Trade (USD)'] = pd.to_numeric(trade_data['Trade (USD)'], errors='coerce')
    
    # Drop rows with missing or NaN values in 'Trade (USD)'
    trade_data = trade_data.dropna(subset=['Trade (USD)'])
    
    return trade_data

def load_tourism_data():
    # Load data from CSV file
    tourism_data = pd.read_csv('data/tourism.csv')
    
    return tourism_data