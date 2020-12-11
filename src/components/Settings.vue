<template>
    <div class="settings">
        <div class="settings__header">
          <h1 class="settings__title">Settings</h1>
          <span class="settings__exit" @click="$emit('exit',false)">X</span>
        </div>
        <div class="settings__form">
          <draggable :options="{handle: '.burger'}" v-model="weatherObjects" group="cities" @start="drag=true" @end="updateItemOrder">
        <div class="added-city"

        v-bind:key="weatheritem.id"
        v-for="weatheritem in weatherObjects">
          <div class="burger">
            <div class="burger__item"></div>
            <div class="burger__item"></div>
            <div class="burger__item"></div>
          </div>
          <div class="added-city__name">{{weatheritem.cityName}}, {{weatheritem.country}}</div>
          <div class="remove-city" @click="$emit('remove-city', weatheritem.id)"><img src="../assets/bin.svg" alt=""></div>
        </div>
        </draggable>
        <div class="settings__subtitle">Add location</div>
        <form class="settings__add-location" v-on:submit.prevent="getWeather">
          <input
            type="text"
            class="settings__location"
            placeholder="What City?"
            v-model="citySearch"
            autocomplete="off"
          />
          <button type="submit" class="settings__enter"><img src="../assets/enter.svg" alt=""></button>
        </form>
        </div>
      <p class="text-center my-3" v-if="cityFound">No city found</p>
    </div>
</template>

<script>
// import { v4 as uuidv4 } from 'uuid';
import draggable from 'vuedraggable';

export default {
  name: "Settings",
  props: [
      "weatherObjects",
  ],
  components: {
    draggable
  },
  data() {
    return {
      visible: false,
      citySearch: "",
      cityFound: false,
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
    }
  },
  methods: {
// Get a random id for each object
    updateItemOrder() {
      this.$emit('reorder-objects',this.weatherObjects);
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
    getWeather: async function () {
      console.log(this.citySearch);
      const key = "5299e83c9cf2fef510fb8ddaa3206ac8";
      const baseURL = `http://api.openweathermap.org/data/2.5/weather?q=${this.citySearch}&appid=${key}&units=metric`;
      //fetch weather
      try {
        const response = await fetch(baseURL);
        const data = await response.json();
        console.log(data);
        this.citySearch = "";
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
        this.$emit('add-new-weather-object',this.weatherObjects);
      } catch (error) {
        console.log(error);
        this.cityFound = true;
        this.visible = false;
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.burger {
  &__item {
      width: 35px;
     height: 5px;
     background-color: black;
     margin: 6px 0;
  }
}

.added-city {
  padding-left: 5px;
  padding-right: 5px;
  display: flex;
  justify-content: space-between;
  background: yellow;
  margin-top: 10px;
  align-items: center;
  & .remove-city img {
    cursor: pointer;
    width: 20px;
    height: 20px;
  }
}
.settings {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__add-location {
    display: flex;
  }
  &__location {
    width: 100%;
  }
  &__enter img {
    width: 40px;
    height: 40px;
  }
  &__exit {
    &:hover {
      background: red;
    }
    display: flex;
    width: 40px;
    height: 40px;
    background: gray;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  } 
}
</style>