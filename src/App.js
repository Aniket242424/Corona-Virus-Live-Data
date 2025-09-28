import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container, 
  Box,
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import GlobalChart from './components/GlobalChart';
import CountryStats from './components/CountryStats';
import axios from 'axios';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [data, setData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('Global');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCountry !== 'Global') {
      fetchCountryData(selectedCountry);
    } else {
      fetchGlobalData();
    }
  }, [selectedCountry]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [globalResponse, countriesResponse] = await Promise.all([
        axios.get('https://disease.sh/v3/covid-19/all'),
        axios.get('https://disease.sh/v3/covid-19/countries')
      ]);
      
      setData(globalResponse.data);
      setCountries(countriesResponse.data);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://disease.sh/v3/covid-19/all');
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch global data.');
      console.error('Error fetching global data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryData = async (country) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://disease.sh/v3/covid-19/countries/${country}`);
      setData(response.data);
    } catch (err) {
      setError(`Failed to fetch data for ${country}.`);
      console.error('Error fetching country data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0} sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          mb: 3
        }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              🌍 Corona Live Data Tracker
            </Typography>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200, bgcolor: 'rgba(255,255,255,0.1)' }}>
              <InputLabel sx={{ color: 'white' }}>Select Country</InputLabel>
              <Select
                value={selectedCountry}
                onChange={handleCountryChange}
                label="Select Country"
                sx={{ 
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  },
                }}
              >
                <MenuItem value="Global">Global</MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.country} value={country.country}>
                    {country.country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Dashboard 
              data={data} 
              selectedCountry={selectedCountry}
              countries={countries}
              loading={loading}
            />
          </motion.div>

          {!loading && data && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <GlobalChart data={data} selectedCountry={selectedCountry} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <CountryStats countries={countries} selectedCountry={selectedCountry} />
              </motion.div>
            </>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <CircularProgress size={60} />
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
