import type { VoiceOption } from '@/types';

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'my-female-1',
    name: 'ခိုင်စာ',
    gender: 'female',
    description: 'အသံနုပျောင်း၊ ရုပ်ရှင် recap အတွက် သင့်တော်',
  },
  {
    id: 'my-male-1',
    name: 'သူရ',
    gender: 'male',
    description: 'အသံထွက်ကြည်လင်၊ ရိုးရာသတင်းပေးစာတန်း',
  },
  {
    id: 'my-female-2',
    name: 'စန္ဒာ',
    gender: 'female',
    description: 'အသံနက်နဲနဲ၊ ဒရာမာရုပ်ရှင်အတွက် အကိုက်ဆုံး',
  },
  {
    id: 'my-male-2',
    name: 'အောင်ကျော်',
    gender: 'male',
    description: 'အသံပြင်းထန်၊ アクションရုပ်ရှင်အတွက်',
  },
];

export function getVoiceById(id: string): VoiceOption | undefined {
  return VOICE_OPTIONS.find((v) => v.id === id);
}
