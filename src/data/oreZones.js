/* Typical filter-cake chemistry per ore zone and mine location (min / max). */
export const ORE_ZONES = {
  E: {
    label: 'East Zone',
    locations: {
      'JSW - Jharsugda': {
        moisture:  { min: 10.80, max: 11.45 }, fe: { min: 60.80, max: 63.91 },
        sio2:      { min: 3.58,  max: 4.36  }, al2o3: { min: 3.08, max: 4.12 },
        blain:     { min: 2188,  max: 2422  }, mic45: { min: 63.50, max: 65.58 },
        bentonite: { min: 3.39,  max: 6.84  }, ob1205: { min: 20.00, max: 38.00 },
        ccs:       { min: 189,   max: 230   }, ti: { min: 92.01, max: 94.39 },
        ai:        { min: 3.75,  max: 6.14  }
      },
      'Chaliyama Steel - Chaibasa': {
        moisture:  { min: 10.00, max: 10.50 }, fe: { min: 60.59, max: 61.85 },
        sio2:      { min: 3.61,  max: 4.45  }, al2o3: { min: 3.02, max: 4.75 },
        blain:     { min: 2358,  max: 2939  }, mic45: { min: 60.04, max: 70.48 },
        bentonite: { min: 2.00,  max: 4.95  }, ob1205: { min: 30.00, max: 36.45 },
        ccs:       { min: 189,   max: 210   }, ti: { min: 92.10, max: 94.59 },
        ai:        { min: 3.70,  max: 5.86  }
      },
      'Dhenkanal Steel - Dhenkanal': {
        moisture:  { min: 9.80,  max: 10.50 }, fe: { min: 60.56, max: 61.50 },
        sio2:      { min: 3.88,  max: 4.75  }, al2o3: { min: 2.85, max: 3.07 },
        blain:     { min: 1965,  max: 2762  }, mic45: { min: 56.42, max: 70.58 },
        bentonite: { min: 3.01,  max: 4.18  }, ob1205: { min: 30.50, max: 59.06 },
        ccs:       { min: 185,   max: 200   }, ti: { min: 93.27, max: 94.46 },
        ai:        { min: 3.75,  max: 4.85  }
      },
      'Kamanada Steel - Koira': {
        moisture:  { min: 9.50,  max: 10.50 }, fe: { min: 61.38, max: 62.62 },
        sio2:      { min: 3.06,  max: 4.16  }, al2o3: { min: 1.93, max: 2.08 },
        blain:     { min: 2400,  max: 3000  }, mic45: { min: 60.75, max: 68.75 },
        bentonite: { min: 2.70,  max: 5.80  }, ob1205: { min: 25.00, max: 77.00 },
        ccs:       { min: 177,   max: 226   }, ti: { min: 93.59, max: 95.58 },
        ai:        { min: 2.85,  max: 4.54  }
      },
      'Gallent Ispat - Gorkhpur': {
        moisture:  { min: 10.50, max: 11.00 }, fe: { min: 61.00, max: 61.50 },
        sio2:      { min: 4.76,  max: 4.90  }, al2o3: { min: 1.87, max: 2.31 },
        blain:     { min: 2100,  max: 2300  }, mic45: { min: 60.00, max: 61.60 },
        bentonite: { min: 3.50,  max: 5.50  }, ob1205: { min: 62.00, max: 80.00 },
        ccs:       { min: 207,   max: 225   }, ti: { min: 96.22, max: 97.00 },
        ai:        { min: 2.27,  max: 2.98  }
      },
      'GR Integrate - Raipur': {
        moisture:  { min: 10.30, max: 11.00 }, fe: { min: 62.00, max: 62.70 },
        sio2:      { min: 4.68,  max: 5.57  }, al2o3: { min: null, max: null },
        blain:     { min: null,  max: null  }, mic45: { min: 57.30, max: 61.20 },
        bentonite: { min: 9.20,  max: 12.30 }, ob1205: { min: 50.00, max: 68.00 },
        ccs:       { min: 180,   max: 200   }, ti: { min: 95.30, max: 95.93 },
        ai:        { min: 2.92,  max: 3.46  }
      },
      'Shree Jagnath Steel - Barbil': {
        moisture:  { min: 11.00, max: 12.00 }, fe: { min: 61.42, max: 62.20 },
        sio2:      { min: 4.50,  max: 5.46  }, al2o3: { min: 3.20, max: 4.10 },
        blain:     { min: 1700,  max: 2550  }, mic45: { min: 59.38, max: 61.50 },
        bentonite: { min: 3.80,  max: 12.50 }, ob1205: { min: 30.00, max: 120.00 },
        ccs:       { min: 180,   max: 215   }, ti: { min: 90.36, max: 92.75 },
        ai:        { min: 5.43,  max: 7.50  }
      },
      'Envirocare - Rourkela': {
        moisture:  { min: 11.50, max: 12.00 }, fe: { min: 60.50, max: 61.00 },
        sio2:      { min: 3.50,  max: 4.00  }, al2o3: { min: 3.50, max: 4.00 },
        blain:     { min: 2000,  max: 2300  }, mic45: { min: 60.50, max: 63.50 },
        bentonite: { min: 7.20,  max: 9.50  }, ob1205: { min: 70.00, max: 120.00 },
        ccs:       { min: 220,   max: 225   }, ti: { min: 94.50, max: 95.00 },
        ai:        { min: 2.70,  max: 3.10  }
      },
      'Shree Mahaveer - Rourkel': {
        moisture:  { min: 11.50, max: 12.00 }, fe: { min: 60.50, max: 61.00 },
        sio2:      { min: 3.50,  max: 4.00  }, al2o3: { min: 3.50, max: 4.00 },
        blain:     { min: 2000,  max: 2300  }, mic45: { min: 60.50, max: 63.50 },
        bentonite: { min: 7.20,  max: 9.50  }, ob1205: { min: 70.00, max: 120.00 },
        ccs:       { min: 220,   max: 225   }, ti: { min: 94.50, max: 95.00 },
        ai:        { min: 2.70,  max: 3.10  }
      },
      'Orissa Metalic Pvt. Ltd - Khargpur': {
        moisture:  { min: 11.50, max: 12.50 }, fe: { min: 59.50, max: 61.50 },
        sio2:      { min: 3.77,  max: 6.66  }, al2o3: { min: 3.50, max: 4.20 },
        blain:     { min: 1600,  max: 1900  }, mic45: { min: 58.50, max: 63.50 },
        bentonite: { min: 11.00, max: 14.00 }, ob1205: { min: 30.00, max: 65.00 },
        ccs:       { min: 170,   max: 220   }, ti: { min: 94.50, max: 95.50 },
        ai:        { min: 2.30,  max: 2.50  }
      },
      'Shyam Metalics - Samblpur': {
        moisture:  { min: 11.50, max: 12.00 }, fe: { min: 60.00, max: 60.50 },
        sio2:      { min: 4.50,  max: 5.00  }, al2o3: { min: 3.80, max: 4.20 },
        blain:     { min: 2000,  max: 2500  }, mic45: { min: 60.00, max: 67.50 },
        bentonite: { min: 7.50,  max: 10.00 }, ob1205: { min: 50.00, max: 70.00 },
        ccs:       { min: 180,   max: 200   }, ti: { min: 94.80, max: 95.50 },
        ai:        { min: 1.90,  max: 2.20  }
      },
      'Super Smelter - Jamuria': {
        moisture:  { min: 11.00, max: 12.00 }, fe: { min: 61.00, max: 62.00 },
        sio2:      { min: 3.20,  max: 4.00  }, al2o3: { min: 2.20, max: 2.50 },
        blain:     { min: 1300,  max: 2000  }, mic45: { min: 57.20, max: 60.75 },
        bentonite: { min: 4.50,  max: 7.80  }, ob1205: { min: 45.00, max: 55.00 },
        ccs:       { min: 185,   max: 180   }, ti: { min: 95.00, max: 96.00 },
        ai:        { min: 2.30,  max: 3.50  }
      },
      'Shyam Sel & Power Ltd. - Jamuria': {
        moisture:  { min: 11.50, max: 12.00 }, fe: { min: 59.50, max: 60.20 },
        sio2:      { min: 4.50,  max: 5.00  }, al2o3: { min: 3.80, max: 4.20 },
        blain:     { min: 2000,  max: 2500  }, mic45: { min: 60.00, max: 67.50 },
        bentonite: { min: 7.50,  max: 10.00 }, ob1205: { min: 50.00, max: 70.00 },
        ccs:       { min: 180,   max: 200   }, ti: { min: 94.80, max: 95.20 },
        ai:        { min: 2.50,  max: 3.00  }
      }
    }
  },
  S: {
    label: 'South Zone',
    locations: {
      'JSW - Bellary': {
        moisture:  { min: 9.20,  max: 10.90 }, fe: { min: 57.60, max: 58.80 },
        sio2:      { min: 6.25,  max: 7.00  }, al2o3: { min: 3.20, max: 3.70 },
        blain:     { min: 3600,  max: 4200  }, mic45: { min: 71.00, max: 73.80 },
        bentonite: { min: 5.30,  max: 7.50  }, ob1205: { min: 28, max: 38 },
        ccs:       { min: 216,   max: 236   }, ti: { min: 92.16, max: 94.00 },
        ai:        { min: 5.20,  max: 6.96  }
      },
      'Minera Steel - Bellary': {
        moisture:  { min: 8.00,  max: 9.50  }, fe: { min: 60.00, max: 62.70 },
        sio2:      { min: 4.00,  max: 5.80  }, al2o3: { min: 1.90, max: 2.50 },
        blain:     { min: 2500,  max: 3200  }, mic45: { min: 66.80, max: 68.49 },
        bentonite: { min: 3.00,  max: 6.00  }, ob1205: { min: 28, max: 35 },
        ccs:       { min: 180,   max: 200   }, ti: { min: 93.00, max: 94.20 },
        ai:        { min: 4.00,  max: 5.18  }
      },
      'MSPL - Baldota': {
        moisture:  { min: 10.50, max: 12.00 }, fe: { min: 61.00, max: 62.80 },
        sio2:      { min: 4.50,  max: 5.50  }, al2o3: { min: 1.80, max: 2.20 },
        blain:     { min: 2500,  max: 3500  }, mic45: { min: 74.50, max: 82.50 },
        bentonite: { min: 12.00, max: 17.00 }, ob1205: { min: 32, max: 45 },
        ccs:       { min: 180,   max: 205   }, ti: { min: 95.00, max: 96.50 },
        ai:        { min: 2.50,  max: 3.80  }
      },
      'Prakash Spong - Chitradurga': {
        moisture:  { min: 8.50,  max: 10.50 }, fe: { min: 59.50, max: 61.60 },
        sio2:      { min: 4.30,  max: 5.70  }, al2o3: { min: 1.80, max: 2.20 },
        blain:     { min: 1800,  max: 2200  }, mic45: { min: 64.00, max: 66.50 },
        bentonite: { min: 7.00,  max: 12.00 }, ob1205: { min: 25, max: 51 },
        ccs:       { min: 170,   max: 210   }, ti: { min: 94.50, max: 96.80 },
        ai:        { min: 2.10,  max: 4.30  }
      },
      'BMM Ispat - Hospet': {
        moisture:  { min: 11.00, max: null  }, fe: { min: 60.80, max: 62.50 },
        sio2:      { min: 5.10,  max: 6.50  }, al2o3: { min: 1.60, max: 2.20 },
        blain:     { min: 2500,  max: 3200  }, mic45: { min: 73.50, max: 75.00 },
        bentonite: { min: 7.50,  max: 13.00 }, ob1205: { min: 22, max: 40 },
        ccs:       { min: 200,   max: 235   }, ti: { min: 95.00, max: 95.80 },
        ai:        { min: 3.60,  max: 4.00  }
      }
    }
  },
  C: {
    label: 'Central Zone',
    locations: {
      'Lloyds Metalics Energy Ltd. - Konsari': {
        moisture:  { min: 9.20,  max: 10.20 }, fe: { min: 64.50, max: 65.10 },
        sio2:      { min: 2.80,  max: 3.30  }, al2o3: { min: 1.70, max: 2.40 },
        blain:     { min: 2100,  max: 3200  }, mic45: { min: 57.00, max: 64.50 },
        bentonite: { min: 3.70,  max: 8.00  }, ob1205: { min: 25.00, max: 46.00 },
        ccs:       { min: 220,   max: 238   }, ti: { min: 95.00, max: 95.50 },
        ai:        { min: 3.00,  max: 3.20  }
      },
      'Shree Bajrang Power & Ispat Ltd. - Tilda': {
        moisture:  { min: 11.50, max: 11.80 }, fe: { min: 62.00, max: 62.50 },
        sio2:      { min: 4.10,  max: 4.30  }, al2o3: { min: 2.00, max: 2.50 },
        blain:     { min: 2200,  max: 3100  }, mic45: { min: 59.00, max: 63.70 },
        bentonite: { min: 4.70,  max: 6.70  }, ob1205: { min: 35.00, max: 50.00 },
        ccs:       { min: 200,   max: 220   }, ti: { min: 93.50, max: 94.00 },
        ai:        { min: 4.00,  max: 4.50  }
      }
    }
  }
};
