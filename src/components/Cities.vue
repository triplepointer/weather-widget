<template>
    <div class="cities">
        <div class="cities__header">
            <p class="cities__title">Weather in</p>
            <img 
            class="settings-icon" 
            src="../assets/settings.svg" 
            @click="$emit('go-to-settings',false)"
            >
        </div>
        <div class="cities__body">
            <div class="cities__item" v-bind:key="weatheritem.id" v-for="weatheritem in weatherObjects">
                <div class="cities__name">{{weatheritem.cityName}}, {{weatheritem.country}}</div>
                <div class="cities__image">
                    <img class="cities__img" v-if="weatheritem.stormy" src="../assets/stormy.png" />
                    <img class="cities__img" v-if="weatheritem.cloudy" src="../assets/cloudy.png" />
                    <img class="cities__img" v-if="weatheritem.clearSky" src="../assets/clearSky.png" />
                    <img class="cities__img" v-if="weatheritem.clearNight" src="../assets/clearNight.png" />
                    <img class="cities__img" v-if="weatheritem.snowy" src="../assets/snowy.png" />
                    <div class="cities__temperature">Temperature: {{weatheritem.temperature}}°C</div>
                </div>
                <div class="cities__description">
                    Feels like {{weatheritem.feelsLike}}°C. {{weatheritem.description}}. {{weatheritem.main}}
                </div>
                <div class="cities__other-characteristics">
                <div class="cities__wind-speed"> Wind speed: {{weatheritem.windSpeed}}m/s</div>
                <div class="cities__atmospheric-pressure">Atmospheric pressure: {{weatheritem.pressure}}hPa</div>
                <div class="cities__humidity">Humidity: {{weatheritem.humidity}}%</div>
                <div class="cities__dew-point">Dew point: {{weatheritem.dewPoint}}°C</div>
                <div class="cities__visibility">Visibility: {{weatheritem.visibility}}m</div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Cities",
    props: [
      "weatherObjects",
  ],
}
</script>

<style lang="scss" scoped>
.cities {
    &__header {
        display: flex;
        justify-content: space-between;
    }
    &__item {
        padding-top: 20px;
    }
    &__img {
        width: 60px;
        height: 60px;
    }
}
.settings-icon {
    width: 30px;
    height: 30px;
    cursor: pointer;
}
</style>