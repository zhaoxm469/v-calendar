<template>
    <div class="scheduling-calendar">
        currentWeekNum:{{ currentWeekNum }}
        <v-calendar
            class="custom-calendar"
            :masks="masks"
            ref="customCalendar"
            :attributes="attributes"
            :rows="rows"
            :minVisibleWeek="currentWeekNum"
            :title-position="titlePosition"
            view="weekly"
            transition="none"
            disable-page-swipe
            is-expanded
        >
            <template v-slot:header-title="{ shortMonthLabel, yearLabel }">
                <span> {{ yearLabel }}年{{ shortMonthLabel }} </span>
            </template>
            <template v-slot:day-content="{ day, attributes }">
                <span class="day-label">{{ day.day }}</span>
                <div v-for="attr in attributes" :key="attr.key">
                    <div
                        v-for="item in attr.customData.lessons"
                        :key="item.lessonId"
                    >
                        <slot :item="item" name="lessonItem" />
                    </div>
                </div>
            </template>
        </v-calendar>
    </div>
</template>

<script>
import { formatLessons } from './format.js';

export default {
    props: {
        titlePosition: {
            type: String,
            default: 'left',
        },
        lessons: {
            type: Array,
            default: () => [],
        },
        rows: {
            type: Number,
            default: 1,
        },
    },
    data() {
        return {
            masks: {
                weekdays: 'WWW',
            },
        };
    },
    computed: {
        attributes() {
            return formatLessons(this.lessons);
        },
        currentWeekNum() {
            return HT.Date.getWeekOfYear(new Date());
        },
    },
    methods: {},
    mounted() {},
};
</script>

<style lang="less" scoped>
@import url('./style.less');
</style>