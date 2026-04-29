export const sampleMarketingData = [
  { Campaign_ID: 1, Channel: 'Social', Ad_Spend: 15.2, Social_Spend: 10.5, Visits: 4500, Conversion_Rate: 0.05, Sales: 40.5, Customer_Age: 25, Success: 1 },
  { Campaign_ID: 2, Channel: 'TV', Ad_Spend: 45.0, Social_Spend: 5.0, Visits: 8200, Conversion_Rate: 0.03, Sales: 85.2, Customer_Age: 45, Success: 1 },
  { Campaign_ID: 3, Channel: 'Search', Ad_Spend: 12.5, Social_Spend: 2.5, Visits: 3200, Conversion_Rate: 0.08, Sales: 38.0, Customer_Age: 32, Success: 1 },
  { Campaign_ID: 4, Channel: 'Email', Ad_Spend: 2.5, Social_Spend: 1.0, Visits: 1500, Conversion_Rate: 0.12, Sales: 18.5, Customer_Age: 38, Success: 0 },
  { Campaign_ID: 5, Channel: 'Social', Ad_Spend: 22.0, Social_Spend: 18.0, Visits: 6200, Conversion_Rate: 0.04, Sales: 52.0, Customer_Age: 22, Success: 1 },
  { Campaign_ID: 6, Channel: 'Search', Ad_Spend: 18.0, Social_Spend: 3.0, Visits: 4800, Conversion_Rate: 0.07, Sales: 48.5, Customer_Age: 35, Success: 1 },
  { Campaign_ID: 7, Channel: 'TV', Ad_Spend: 55.0, Social_Spend: 8.0, Visits: 9500, Conversion_Rate: 0.02, Sales: 95.0, Customer_Age: 50, Success: 1 },
  { Campaign_ID: 8, Channel: 'Email', Ad_Spend: 3.0, Social_Spend: 1.5, Visits: 1800, Conversion_Rate: 0.10, Sales: 22.0, Customer_Age: 40, Success: 0 },
  { Campaign_ID: 9, Channel: 'Social', Ad_Spend: 10.0, Social_Spend: 8.0, Visits: 3100, Conversion_Rate: 0.06, Sales: 28.5, Customer_Age: 28, Success: 0 },
  { Campaign_ID: 10, Channel: 'Display', Ad_Spend: 8.5, Social_Spend: 2.0, Visits: 2500, Conversion_Rate: 0.03, Sales: 15.2, Customer_Age: 33, Success: 0 },
  { Campaign_ID: 11, Channel: 'Search', Ad_Spend: 25.0, Social_Spend: 5.0, Visits: 6000, Conversion_Rate: 0.09, Sales: 75.0, Customer_Age: 31, Success: 1 },
  { Campaign_ID: 12, Channel: 'Social', Ad_Spend: 30.0, Social_Spend: 25.0, Visits: 8500, Conversion_Rate: 0.05, Sales: 68.0, Customer_Age: 24, Success: 1 },
  { Campaign_ID: 13, Channel: 'TV', Ad_Spend: 60.0, Social_Spend: 10.0, Visits: 11000, Conversion_Rate: 0.025, Sales: 105.0, Customer_Age: 48, Success: 1 },
  { Campaign_ID: 14, Channel: 'Display', Ad_Spend: 14.0, Social_Spend: 3.0, Visits: 3800, Conversion_Rate: 0.04, Sales: 25.0, Customer_Age: 36, Success: 0 },
  { Campaign_ID: 15, Channel: 'Email', Ad_Spend: 4.5, Social_Spend: 2.0, Visits: 2300, Conversion_Rate: 0.11, Sales: 29.5, Customer_Age: 42, Success: 0 },
  { Campaign_ID: 16, Channel: 'Search', Ad_Spend: 16.5, Social_Spend: 4.0, Visits: 4200, Conversion_Rate: 0.08, Sales: 45.0, Customer_Age: 34, Success: 1 },
  { Campaign_ID: 17, Channel: 'Social', Ad_Spend: 18.0, Social_Spend: 14.0, Visits: 5200, Conversion_Rate: 0.055, Sales: 44.0, Customer_Age: 26, Success: 1 },
  { Campaign_ID: 18, Channel: 'Display', Ad_Spend: 9.0, Social_Spend: 2.5, Visits: 2800, Conversion_Rate: 0.035, Sales: 18.0, Customer_Age: 39, Success: 0 },
  { Campaign_ID: 19, Channel: 'TV', Ad_Spend: 35.0, Social_Spend: 6.0, Visits: 7000, Conversion_Rate: 0.022, Sales: 65.0, Customer_Age: 46, Success: 1 },
  { Campaign_ID: 20, Channel: 'Email', Ad_Spend: 5.0, Social_Spend: 2.5, Visits: 2700, Conversion_Rate: 0.09, Sales: 32.0, Customer_Age: 37, Success: 1 },
];

export const getSampleColumns = () => {
    if(sampleMarketingData.length === 0) return [];
    return Object.keys(sampleMarketingData[0]);
}
