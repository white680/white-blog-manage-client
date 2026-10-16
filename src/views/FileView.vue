<template>
  <yk-space size="xl" dir="vertical" class="file-view">
    <TopTitle name="本地文件" :isSearch='false'  style="width:100%;">
        <template #custom>
            <yk-space size="xl" align="center">
                <yk-text type="third">
                    图片、视频、音频大小不超过20M
                    <yk-button style="--pcolor: #8a3ee8">上传</yk-button>
                </yk-text>
            </yk-space>
        </template>
    </TopTitle>
    <SubSet></SubSet>
    <Files></Files>
  </yk-space>
</template>

<script setup lang="ts">
import TopTitle from '../components/bar/TopTitle.vue';
import SubSet from '../components/localfile/subset/index.vue'
import Files from '../components/localfile/files/index.vue'
</script>

<style scoped lang="less">
.file-view{
    width: 100%;
}
</style>
