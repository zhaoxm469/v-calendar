<template>
    <div class="scheduling-calendar">
        <v-calendar
            class="custom-calendar"
            :masks="masks"
            ref="customCalendar"
            :attributes="attributes"
            @update:from-page="onFormPage"
            :rows="rows"
            :title-position="titlePosition"
            view="weekly"
            transition="none"
            disable-page-swipe
            is-expanded
        >
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
import { getWeekOfMonth } from './utils.js';

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
        // 隐藏当前月份中，在当前周之前的所有周。
        hidePastWeeks: {
            type: Boolean,
            default: false,
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
    },
    methods: {
        onFormPage(value) {
            this.$nextTick(() => {
                this.setHidePastWeeks();
            });
        },
        setHidePastWeeks() {
            if (!this.hidePastWeeks) return;
            const currentWeekNumber = getWeekOfMonth();
            const calendarEl = this.$refs.customCalendar.$el;
            const currentYearMonth = HT.Date.toString(new Date(), 'yyyy-MM');

            for (let i = 1; i < currentWeekNumber; i++) {
                const weekElements = calendarEl.querySelectorAll(
                    `.in-month.week-${i}`,
                );

                weekElements.forEach(item => {
                    // 检查元素类名中是否包含当前年月
                    if (
                        item.classList
                            .toString()
                            .includes(`id-${currentYearMonth}`)
                    ) {
                        item.style.display = 'none';
                    }
                });
            }
        },
    },
    mounted() {
        this.setHidePastWeeks();
    },
};
</script>


<style lang="less" scoped>
@import url('./style.less');
</style>