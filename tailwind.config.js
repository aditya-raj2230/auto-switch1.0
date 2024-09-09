/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
      extend: {
        colors: {
          cream: {
            DEFAULT: '#eaefbd',
            100: '#404511',
            200: '#7f8a21',
            300: '#bece33',
            400: '#d4de78',
            500: '#eaefbd',
            600: '#eef2ca',
            700: '#f2f5d8',
            800: '#f7f9e5',
            900: '#fbfcf2',
          },
          tea_green: {
            DEFAULT: '#c9e3ac',
            100: '#293c14',
            200: '#527728',
            300: '#7bb33c',
            400: '#a2cf6f',
            500: '#c9e3ac',
            600: '#d4e9bc',
            700: '#deeecd',
            800: '#e9f4dd',
            900: '#f4f9ee',
          },
          pistachio: {
            DEFAULT: '#90be6d',
            100: '#1d2a13',
            200: '#395325',
            300: '#567d38',
            400: '#72a64b',
            500: '#90be6d',
            600: '#a7cb8c',
            700: '#bdd8a8',
            800: '#d3e5c5',
            900: '#e9f2e2',
          },
          carrot_orange: {
            DEFAULT: '#ea9010',
            100: '#2f1d03',
            200: '#5d3906',
            300: '#8c560a',
            400: '#bb720d',
            500: '#ea9010',
            600: '#f1a63c',
            700: '#f5bc6d',
            800: '#f8d39e',
            900: '#fce9ce',
          },
          darkbeige:{
            DEFAULT:'#efe8de'
          },
          drab_dark_brown: {
            DEFAULT: '#37371f',
            100: '#0b0b06',
            200: '#16160c',
            300: '#212113',
            400: '#2c2c19',
            500: '#37371f',
            600: '#6e6e3e',
            700: '#a4a45c',
            800: '#c2c293',
            900: '#e1e1c9',
          },
        },
      },
  
  },
  plugins: [],
}
