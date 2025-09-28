import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Box, 
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search, TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const CountryStats = ({ countries, selectedCountry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('cases');

  const filteredCountries = countries
    .filter(country => 
      country.country.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, 10);

  const getCountryFlag = (countryInfo) => {
    return countryInfo?.flag || '🌍';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num?.toLocaleString() || 0;
  };

  const getTrendIcon = (todayCases) => {
    if (todayCases > 0) {
      return <TrendingUp sx={{ color: '#ff4081', fontSize: 16 }} />;
    } else if (todayCases < 0) {
      return <TrendingDown sx={{ color: '#4caf50', fontSize: 16 }} />;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Top Countries
          </Typography>
          
          <TextField
            fullWidth
            size="small"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 188, 212, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00bcd4',
                },
              },
            }}
          />

          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
            {['cases', 'deaths', 'recovered', 'active'].map((sort) => (
              <Chip
                key={sort}
                label={sort.charAt(0).toUpperCase() + sort.slice(1)}
                size="small"
                clickable
                onClick={() => setSortBy(sort)}
                variant={sortBy === sort ? 'filled' : 'outlined'}
                sx={{
                  bgcolor: sortBy === sort ? 'rgba(0, 188, 212, 0.2)' : 'transparent',
                  color: sortBy === sort ? '#00bcd4' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(0, 188, 212, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 188, 212, 0.1)',
                  }
                }}
              />
            ))}
          </Box>

          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            <AnimatePresence>
              {filteredCountries.map((country, index) => (
                <motion.div
                  key={country.country}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ListItem
                    sx={{
                      bgcolor: selectedCountry === country.country ? 'rgba(0, 188, 212, 0.1)' : 'transparent',
                      borderRadius: 2,
                      mb: 1,
                      border: selectedCountry === country.country ? '1px solid rgba(0, 188, 212, 0.3)' : '1px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        transform: 'translateX(4px)',
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={getCountryFlag(country.countryInfo)}
                        alt={country.country}
                        sx={{ 
                          width: 32, 
                          height: 24,
                          bgcolor: 'rgba(0, 188, 212, 0.2)'
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {country.country}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getTrendIcon(country.todayCases)}
                            <Typography variant="body2" color="textSecondary">
                              {formatNumber(country[sortBy])}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box display="flex" gap={1} mt={0.5}>
                          <Chip
                            label={`+${formatNumber(country.todayCases)}`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(33, 150, 243, 0.2)',
                              color: '#2196f3',
                              fontSize: '0.7rem',
                              height: 20
                            }}
                          />
                          <Chip
                            label={`${formatNumber(country.todayDeaths)} deaths`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(244, 67, 54, 0.2)',
                              color: '#f44336',
                              fontSize: '0.7rem',
                              height: 20
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>

          {filteredCountries.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                No countries found matching "{searchTerm}"
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CountryStats;