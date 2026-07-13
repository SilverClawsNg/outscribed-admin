import { defineStore } from 'pinia';
import { ref } from 'vue';

export type AlertType = 'Success' | 'Warning' | 'Danger' | 'Info' | 'Loading';

export interface AlertState {
  type: AlertType;
  message: string | null;
  buttonText: string;
  show: boolean;
  onActionClick: (() => Promise<void>) | null;
}

export const useAlert = defineStore('alert', () => {
  const type = ref<AlertType>('Info');
  const message = ref<string | null>(null);
  const buttonText = ref<string>('Click here');
  const show = ref(false);
  const onActionClick = ref<(() => Promise<void>) | null>(null);

  // Replaces CancellationTokenSource for tracking active auto-dismiss timeouts
  let activeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  function clearTimer() {
    if (activeTimeoutId) {
      clearTimeout(activeTimeoutId);
      activeTimeoutId = null;
    }
  }

  function set(
    msg: string,
    alertType: AlertType,
    btnText: string = 'Click here',
    onClickAction: (() => Promise<void>) | null = null
  ) {
    if (!msg || !msg.trim()) return;

          console.log('🚀 [alert set]: Setting...')

    // 1. Cancel active auto-dismiss cycles immediately
    clearTimer();

    // 2. Hydrate global reactive state values
    message.value = msg;
    type.value = alertType;
    buttonText.value = btnText;
    onActionClick.value = onClickAction;
    show.value = true;

    // 3. Match Blazor duration rules based on intent types
    let delayDuration = -1;
    if (alertType === 'Success') delayDuration = 5000;
    else if (alertType === 'Info') delayDuration = 15000;

    // 4. Schedule dismissal if threshold requirements pass
    if (delayDuration > 0) {
      activeTimeoutId = setTimeout(() => {
        close();
      }, delayDuration);
    }
  }

  function close() {
    clearTimer();
    message.value = null;
    onActionClick.value = null;
    show.value = false;
  }

  return {
    type,
    message,
    buttonText,
    show,
    onActionClick,
    set,
    close
  };
});