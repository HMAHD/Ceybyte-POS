/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                              Festival Auto-Update Utility                                        │
 * │                                                                                                  │
 * │  Description: Utility functions to automatically update festival data when needed.              │
 * │               Ensures festival data is always available for current and next year.              │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

import { autoUpdateFestivals, initializeFestivalsForYear } from '@/api/sri-lankan-features.api';

/**
 * Check and initialize festival data for current and next year
 * This should be called when the app starts
 */
export const initializeFestivalData = async (): Promise<void> => {
  try {
    console.log('Checking festival data availability...');
    
    const result = await autoUpdateFestivals();
    
    if (result.success && result.data) {
      console.log('Festival data update completed:', result.data);
      
      // Log the results for each year
      result.data.results.forEach(yearResult => {
        if (yearResult.action === 'created') {
          console.log(`✓ Initialized ${yearResult.count} festivals for ${yearResult.year}`);
        } else {
          console.log(`✓ Festival data already exists for ${yearResult.year} (${yearResult.count} entries)`);
        }
      });
    } else {
      console.error('Failed to auto-update festivals:', result.error);
    }
  } catch (error) {
    console.error('Error during festival data initialization:', error);
  }
};

/**
 * Initialize festival data for a specific year
 * Useful for admin functions or when user requests specific year data
 */
export const initializeSpecificYear = async (year: number): Promise<boolean> => {
  try {
    console.log(`Initializing festival data for ${year}...`);
    
    const result = await initializeFestivalsForYear(year);
    
    if (result.success && result.data) {
      if (result.data.action === 'created') {
        console.log(`✓ Successfully created ${result.data.festivals_created} festivals for ${year}`);
      } else {
        console.log(`✓ Festival data already exists for ${year} (${result.data.existing_count} entries)`);
      }
      return true;
    } else {
      console.error(`Failed to initialize festivals for ${year}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`Error initializing festivals for ${year}:`, error);
    return false;
  }
};

/**
 * Check if we need to initialize festival data for upcoming years
 * This can be called periodically or when user navigates to future dates
 */
export const checkAndInitializeFutureYears = async (targetYear: number): Promise<void> => {
  const currentYear = new Date().getFullYear();
  
  // Initialize data for years from current year to target year
  for (let year = currentYear; year <= targetYear; year++) {
    await initializeSpecificYear(year);
  }
};

/**
 * Get the next few years that might need festival data
 * Useful for preloading data
 */
export const getYearsToPreload = (): number[] => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear + 1, currentYear + 2];
};

/**
 * Preload festival data for the next few years
 * Can be called during app initialization or idle time
 */
export const preloadFestivalData = async (): Promise<void> => {
  const yearsToPreload = getYearsToPreload();
  
  console.log('Preloading festival data for years:', yearsToPreload);
  
  for (const year of yearsToPreload) {
    await initializeSpecificYear(year);
  }
  
  console.log('Festival data preloading completed');
};

/**
 * Check if it's time to update festival data (e.g., at the start of a new year)
 * This can be called on app startup to ensure data is current
 */
export const shouldUpdateFestivalData = (): boolean => {
  const lastUpdateKey = 'festival_data_last_update';
  const lastUpdate = localStorage.getItem(lastUpdateKey);
  
  if (!lastUpdate) {
    return true; // Never updated before
  }
  
  const lastUpdateDate = new Date(lastUpdate);
  const now = new Date();
  
  // Update if it's been more than 30 days or if we're in a new year
  const daysSinceUpdate = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24);
  const isNewYear = now.getFullYear() > lastUpdateDate.getFullYear();
  
  return daysSinceUpdate > 30 || isNewYear;
};

/**
 * Mark festival data as updated
 */
export const markFestivalDataUpdated = (): void => {
  const lastUpdateKey = 'festival_data_last_update';
  localStorage.setItem(lastUpdateKey, new Date().toISOString());
};

/**
 * Main function to be called on app startup
 * Handles all festival data initialization logic
 */
export const handleAppStartupFestivalInit = async (): Promise<void> => {
  try {
    if (shouldUpdateFestivalData()) {
      console.log('Festival data needs updating...');
      await initializeFestivalData();
      markFestivalDataUpdated();
    } else {
      console.log('Festival data is up to date');
    }
    
    // Always ensure current and next year data exists
    await preloadFestivalData();
  } catch (error) {
    console.error('Error during app startup festival initialization:', error);
  }
};