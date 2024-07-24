<template>
    <div class="lesson-item">
        <span>1</span>
        <span>8:00-10:00</span>
        <div class="lesson-item-title">{{ lessonItem.teacher.name }}</div>
    </div>
</template>
<script>
export default {
    props: {
        lessonItem: {
            type: Object,
            default: () => {
                return {};
            },
        },
    },
};
</script>
<style lang="less" scoped>
.lesson-item {
    background: #fff;
    border-radius: 4px;
    padding: 4px 10px;
    margin-top: 10px;
    cursor: pointer;
}
</style>