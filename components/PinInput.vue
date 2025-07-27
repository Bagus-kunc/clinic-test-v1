<template>
  <div class="flex flex-row md:gap-12 sm:gap-10 gap-5">
    <input
      v-for="(value, index) in otp"
      :key="index"
      type="text"
      inputmode="numeric"
      maxlength="1"
      :disabled="disabled"
      v-model="otp[index]"
      :class="{ 'pointer-events-none': isBlocked(index) }"
      @input="onInput(index, $event)"
      @paste="onPaste($event)"
      @keydown.backspace="onBackspace(index)"
      class="bg-white border-2 border-[#c4c3c2] md:text-5xl sm:text-2xl text-lg font-semibold text-center rounded-md md:w-36 md:h-36 sm:w-24 sm:h-24 w-16 h-16 focus:outline-none shadow-md shadow-gray-400"
      :ref="(el) => (otpRefs[index] = el)"
    />
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue';
const props = defineProps({
  length: {
    type: Number,
    default: 6,
  },
  modelValue: {
    type: String,
    default: '',
  },
  clearField: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['update:modelValue']);
const otp = ref(props.modelValue.split('').concat(Array(props.length).fill('')).slice(0, props.length));
const otpRefs = ref([]);
const isNumeric = (value) => /^[0-9]$/.test(value);
const onInput = (index, event) => {
  const value = event.target.value;
  if (isNumeric(value)) {
    otp.value[index] = value;
    emit('update:modelValue', otp.value.join(''));
    if (index < props.length - 1 && otp.value[index]) {
      otpRefs.value[index + 1]?.focus();
    }
  } else {
    otp.value[index] = '';
  }
};
const onBackspace = (index) => {
  if (index > 0 && !otp.value[index]) {
    const prevIndex = index - 1;
    otpRefs.value[prevIndex]?.focus();
  }
};

const onPaste = (event) => {
  event.preventDefault();
  const pasteData = event.clipboardData
    .getData('text')
    .split('')
    .filter((char) => !/[a-zA-Z]/.test(char))
    .slice(0, props.length);
  otp.value = pasteData.concat(Array(props.length - pasteData.length).fill(''));
  emit('update:modelValue', otp.value.join(''));
  const firstEmptyIndex = otp.value.findIndex((val) => !val);
  if (firstEmptyIndex !== -1) {
    otpRefs.value[firstEmptyIndex]?.focus();
  } else {
    otpRefs.value[otp.value.length - 1]?.focus();
  }
};
const isBlocked = (index) => {
  const otpLength = otp.value.join('').length;
  return Math.min(otpLength, props.length - 1) !== index;
};

watch(
  () => props.clearField,
  (newValue) => {
    if (newValue) {
      otp.value = Array(props.length).fill('');
      emit('update:modelValue', otp.value.join(''));
    }
  },
);
watch(
  () => props.modelValue,
  (newValue) => {
    otp.value = newValue.split('').concat(Array(props.length).fill('')).slice(0, props.length);
  },
);
onMounted(() => {
  otpRefs.value[0]?.focus();
});
</script>
