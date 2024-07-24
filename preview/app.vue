<template>
    <div style="padding: 40px 200px; background: #fff; overflow: auto">
        <!-- <div>
            <SchedulingCalendar :lessons="lessons">
                <template #lessonItem="{ item }">
                    <LessonItem :lessonItem="item" />
                </template>
            </SchedulingCalendar>
        </div>
        <div>
            <SchedulingCalendar :lessons="lessons" :rows="2">
                <template #lessonItem="{ item }">
                    <LessonItem :lessonItem="item" />
                </template>
            </SchedulingCalendar>
        </div> -->

        <div>
            <h1 style="text-align: center; margin: 40px 0">
                <!-- 隐藏当前月份中，在当前周之前的所有周。 -->
            </h1>
            <SchedulingCalendar
                :lessons="lessons"
                :rows="2"
                :hidePastWeeks="true"
            >
                <template #lessonItem="{ item }">
                    <LessonItem :lessonItem="item" />
                </template>
            </SchedulingCalendar>
        </div>
    </div>
</template>

<script>
import SchedulingCalendar from './components/SchedulingCalendar/index.vue';
import LessonItem from './LessonItem.vue';
import mockLessons from './mock.js';

export default {
    components: {
        LessonItem,
        SchedulingCalendar,
    },
    data() {
        return {
            lessons: [],
        };
    },
    methods: {
        loadLessons() {
            this.lessons = mockLessons().data.list;
            // HT.Ajax.post('/api/lesson/checking/query', {}, res => {
            //     this.lessons = res.list;
            // });
        },
    },
    mounted() {
        this.loadLessons();
    },
};
</script>

<style lang="less" scoped>
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
