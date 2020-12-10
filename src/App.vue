<template>
  <div id="main">
    <div class="container">
      <Settings 
      v-if="!changeWindow"
      v-on:exit="changeWindows"
      v-on:remove-city="removeCity"

      v-bind:weatherObjects="weatherObjects"

      v-on:add-new-weather-object="addNewWeatherObject"
      v-on:reorder-objects="addNewWeatherObject"
      />
      <Cities 
      v-if="changeWindow" 
      v-on:go-to-settings="changeWindows"
      
      v-bind:weatherObjects="weatherObjects"
      />
    </div>
  </div>
</template>

<script>
import Settings from "./components/Settings.vue";
import Cities from "./components/Cities.vue";

const STORAGE_KEY = "STORAGE";
const STORAGE_INITIAL = "STORAGE_INITIAL";

let storage = {
  fetch: () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
  save: objects => localStorage.setItem(STORAGE_KEY, JSON.stringify(objects))
};

export default {
  name: "App",
  components: {
      Settings,
      Cities
  },
  data() {
    return {
      visible: false,
      cityFound: false,
      currentLatitude: Number,
      currentLongitude: Number,
      changeWindow: false,
      weatherObjects: storage.fetch(),
            weather: {
        id: 0,
        stormy: false,
        cloudy: false,
        clearSky: false,
        clearNight: false,
        snowy: false,
        isDay: true,
        cityName: "Gwarinpa",
        country: "NG",
        temperature: 12,
        feelsLike: "20",
        description: "Clouds everywhere",
        main: "Clouds",
        windSpeed: "20",
        pressure: "20",
        humidity: "55",
        dewPoint: "29",
        visibility: "10000",
      },
    };
  },
  async beforeMount() {
    try {
        let flag = (localStorage.getItem(STORAGE_INITIAL) || false) && ( this.weatherObjects.length !== 0);
        if (flag == false) {
          let position = await this.getCurrentlocation();
          this.currentLatitude = position.coords.latitude;
          this.currentLongitude = position.coords.longitude;
          console.log(this.currentLatitude, this.currentLongitude)
          await this.getWeather();
          this.addNewWeatherObject(this.weatherObjects);
          localStorage.setItem(STORAGE_INITIAL, true);
        }
    } catch(e) {
      alert(e);
    } finally {
      setInterval(() => {
        this.updateWeather();
      }, 60000);
    }
  },
  methods: {
    async updateWeather() {
      for (let i = 0; i < this.weatherObjects.length; i++ ) {
        let cityName = this.weatherObjects[i].cityName;
        this.weatherObjects = this.weatherObjects.filter((elem)=>{
          return elem.cityName !== cityName;
        });
        this.getWeatherByCityName(cityName);
      }
    },
    getNewId() {
      let id;
      do {
        id = Math.random();
      } while(this.idExists(id))
      return id;
    },
    idExists(id) {
      for(let weather of this.weatherObjects) {
        if (weather.id === id)
          return true;
      }
      return false;
    },
    getWeatherByCityName: async function(cityName) {
      console.log(cityName);
      const key = "5299e83c9cf2fef510fb8ddaa3206ac8";
      const baseURL = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${key}&units=metric`;
      //fetch weather
      try {
        const response = await fetch(baseURL);
        const data = await response.json();
        console.log(data);
        const returnedTarget = Object.assign({}, this.weather);
        returnedTarget.id = this.getNewId();
        returnedTarget.cityName = data.name; // City name
        returnedTarget.country = data.sys.country; // Country code
        returnedTarget.temperature = Math.round(data.main.temp); // temperature
        returnedTarget.feelsLike = Math.round(data.main.feels_like); // feels like
        returnedTarget.description = 
        data.weather[0].description.slice(0, 1).toUpperCase() +
        data.weather[0].description.substring(1); // Weather condition within the group
        returnedTarget.main = data.weather[0].main; //  Group of weather parameters (Rain, Snow, Extreme etc.)
        returnedTarget.windSpeed = data.wind.speed; // Wind Speed
        returnedTarget.pressure = data.main.pressure; // Atmospheric pressure 
        returnedTarget.humidity = Math.round(data.main.humidity); // Humidity

        const additionalURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=hourly,daily&appid=${key}`;

        const additionalResponse = await fetch(additionalURL);
        const additionalData = await  additionalResponse.json();

        returnedTarget.dewPoint = additionalData.current.dew_point; // Dew point
        returnedTarget.visibility =  additionalData.current.visibility; // Visibility

        console.log(additionalData);

        const timeOfDay = data.weather[0].icon;

        ///check for time of day
        if (timeOfDay.includes("n")) {
          returnedTarget.isDay = false;
        } else {
          returnedTarget.isDay = true;
        }

        returnedTarget.main = data.weather[0].main;
        //check weather pictures
        if (returnedTarget.main.includes("Clouds") || returnedTarget.main.includes("Mist")) {
          returnedTarget.stormy = false;
          returnedTarget.cloudy = true;
          returnedTarget.clearSky = false;
          returnedTarget.clearNight = false;
          returnedTarget.snowy = false;
        }
        if (
          returnedTarget.main.includes("Thunderstorm") ||
          returnedTarget.main.includes("Rain")
        ) {
          returnedTarget.stormy = true;
          returnedTarget.cloudy = false;
          returnedTarget.clearSky = false;
          returnedTarget.clearNight = false;
          returnedTarget.snowy = false;
        }
        if (returnedTarget.main.includes("Clear") && returnedTarget.isDay) {
          returnedTarget.stormy = false;
          returnedTarget.cloudy = false;
          returnedTarget.clearSky = true;
          returnedTarget.clearNight = false;
          returnedTarget.snowy = false;
        }
        if (returnedTarget.main.includes("Clear") && !returnedTarget.isDay) {
          returnedTarget.stormy = false;
          returnedTarget.cloudy = false;
          returnedTarget.clearSky = false;
          returnedTarget.clearNight = true;
          returnedTarget.snowy = false;
        }
        if (returnedTarget.main.includes("Snow")) {
          returnedTarget.stormy = false;
          returnedTarget.cloudy = false;
          returnedTarget.clearSky = false;
          returnedTarget.clearNight = false;
          returnedTarget.snowy = true;
        }

        this.visible = true;
        
        this.cityFound = false;

        this.weatherObjects.push(returnedTarget);

        console.log(this.weatherObjects);
      } catch (error) {
        console.log(error);
        this.cityFound = true;
        this.visible = false;
        throw new Error("error!");
      }
    }
    ,
      getWeather: async function () {
      const key = "5299e83c9cf2fef510fb8ddaa3206ac8";
      const baseURL = `http://api.openweathermap.org/data/2.5/weather?lat=${this.currentLatitude}&lon=${this.currentLongitude}&appid=${key}&units=metric`;
      //fetch weather
      try {
        const response = await fetch(baseURL);
        const data = await response.json();
        console.log(data);
        const returnedTarget = Object.assign({}, this.weather);
        returnedTarget.id = this.getNewId();
        returnedTarget.cityName = data.name; // City name
        returnedTarget.country = data.sys.country; // Country code
        returnedTarget.temperature = Math.round(data.main.temp); // temperature
        returnedTarget.feelsLike = Math.round(data.main.feels_like); // feels like
        returnedTarget.description = 
        data.weather[0].description.slice(0, 1).toUpperCase() +
        data.weather[0].description.substring(1); // Weather condition within the group
        returnedTarget.main = data.weather[0].main; //  Group of weather parameters (Rain, Snow, Extreme etc.)
        returnedTarget.windSpeed = data.wind.speed; // Wind Speed
        returnedTarget.pressure = data.main.pressure; // Atmospheric pressure 
        returnedTarget.humidity = Math.round(data.main.humidity); // Humidity

        const additionalURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=hourly,daily&appid=${key}`;
        const additionalResponse = await fetch(additionalURL);
        const additionalData = await  additionalResponse.json();

        returnedTarget.dewPoint = additionalData.current.dew_point; // Dew point
        returnedTarget.visibility =  additionalData.current.visibility; // Visibility

        console.log(additionalData);

        const timeOfDay = data.weather[0].icon;

        ///check for time of day
        if (timeOfDay.includes("n")) {
          returnedTarget.isDay = false;
        } else {
          returnedTarget.isDay = true;
        }

        returnedTarget.main = data.weather[0].main;
        //check weather pictures
        if (returnedTarget.main.includes("Clouds") || returnedTarget.main.includes("Mist")) {
          returnedTarget.stormy = false;
          returnedTarget.cloudy = true;
          returnedTarget.clearSky = false;
          returnedTarget.clearNight = false;
          returnedTarget.snowy = false;
        }
        if (
          returnedTarget.main.includes("Thunderstorm") ||
          returnedTarget.main.includes("Rain")
        ) {
          returnedTarget.stormy = true;
          returnedTarget.cloudy = false;
          returnedTarget.clearSky = false;
          returnedTarget.clearNight = false;
          returnedTarget.snowy = false;
        }
        if (returnedTarget.main.includes("Clear") && returnedTarget.isDay) {
          returnedTarget.stormy = false;
          returnedTarget.cloudy = false;
          returnedTarget.clearSky = true;
          returnedTarget.clearNight = false;
          returnedTarget.snowy = false;
        }
        if (returnedTarget.main.includes("Clear") && !returnedTarget.isDay) {
          returnedTarget.stormy = false;
          returnedTarget.cloudy = false;
          returnedTarget.clearSky = false;
          returnedTarget.clearNight = true;
          returnedTarget.snowy = false;
        }
        if (returnedTarget.main.includes("Snow")) {
          returnedTarget.stormy = false;
          returnedTarget.cloudy = false;
          returnedTarget.clearSky = false;
          returnedTarget.clearNight = false;
          returnedTarget.snowy = true;
        }

        this.visible = true;
        
        this.cityFound = false;

        this.weatherObjects.push(returnedTarget);

        console.log(this.weatherObjects);
      } catch (error) {
        console.log(error);
        this.cityFound = true;
        this.visible = false;
        throw new Error("error!");
      }
    },
    // getCoords(position) {
    //   this.currentLatitude = position.coords.latitude;
    //   this.currentLongitude = position.coords.longitude;
    //   console.log(this.currentLatitude, this.currentLongitude)
    //   let returnedValue = this.getWeather();
    //   if (returnedValue) {
    //     this.addNewWeatherObject(this.weatherObjects);
    //     localStorage.setItem(STORAGE_INITIAL, true);
    //   }
    // },
    async getCurrentlocation() {
        return new Promise(function(resolve, reject) {
            return navigator.geolocation.getCurrentPosition(resolve, reject);
      });
    },
    changeWindows(changeWindowValue) {
      this.changeWindow = changeWindowValue;
    },
    addNewWeatherObject(object) {
      this.weatherObjects = object;
      storage.save(this.weatherObjects);
    },
    removeCity(id) {
      this.weatherObjects = this.weatherObjects.filter(el => {
        return el.id !== id;
      });
      storage.save(this.weatherObjects);
    }
  },
};
</script>

<style lang="scss" scoped>
#main {
  padding: 20px;
}
.container {
  max-width: 300px;
}
</style>
