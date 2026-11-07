
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAN_STORAGE_KEY = '@hamrah_danesh_study_plans';

const days = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
];

const subjects = [
  { title: 'زیست', icon: '🧬' },
  { title: 'فیزیک', icon: '⚡' },
  { title: 'شیمی', icon: '🧪' },
  { title: 'ریاضی', icon: '📐' },
  { title: 'ادبیات', icon: '📖' },
  { title: 'عربی', icon: '📝' },
  { title: 'زبان', icon: '🌍' },
  { title: 'دینی', icon: '📚' },
  { title: 'سایر', icon: '📌' },
];

export default function StudyPlanner({ onBack }) {
  const [plans, setPlans] = useState([]);
  const [selectedDay, setSelectedDay] = useState('شنبه');
  const [loading, setLoading] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState('ریاضی');
  const [topic, setTopic] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      const saved = await AsyncStorage.getItem(PLAN_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPlans(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.log('خطا در بارگذاری برنامه‌ها:', error);
    } finally {
      setLoading(false);
    }
  }

  async function persistPlans(newPlans) {
    try {
      await AsyncStorage.setItem(
        PLAN_STORAGE_KEY,
        JSON.stringify(newPlans)
      );
      setPlans(newPlans);
      return true;
    } catch (error) {
      console.log('خطا در ذخیره برنامه:', error);
      Alert.alert('خطا', 'ذخیره برنامه انجام نشد.');
      return false;
    }
  }

  function timeToMinutes(value) {
    const parts = value.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  function validTime(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  }

  function clearForm() {
    setSelectedSubject('ریاضی');
    setTopic('');
    setStartTime('');
    setEndTime('');
    setEditingId(null);
  }

  async function savePlan() {
    if (!selectedSubject) {
      Alert.alert('انتخاب درس', 'لطفاً یک درس انتخاب کنید.');
      return;
    }

    if (!topic.trim()) {
      Alert.alert('موضوع مطالعه', 'موضوع برنامه را وارد کنید.');
      return;
    }

    if (!validTime(startTime) || !validTime(endTime)) {
      Alert.alert(
        'ساعت نامعتبر',
        'ساعت را با قالب ۲۴ ساعته وارد کنید؛ مانند 08:30'
      );
      return;
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      Alert.alert(
        'زمان نامعتبر',
        'ساعت پایان باید بعد از ساعت شروع باشد.'
      );
      return;
    }

    const plan = {
      id: editingId || Date.now().toString(),
      day: selectedDay,
      subject: selectedSubject,
      topic: topic.trim(),
      startTime,
      endTime,
    };

    const newPlans = editingId
      ? plans.map((item) => item.id === editingId ? plan : item)
      : [...plans, plan];

    const saved = await persistPlans(newPlans);

    if (saved) {
      clearForm();
      Alert.alert('موفق', 'برنامه درسی ذخیره شد.');
    }
  }

  function editPlan(plan) {
    setSelectedDay(plan.day);
    setSelectedSubject(plan.subject);
    setTopic(plan.topic);
    setStartTime(plan.startTime);
    setEndTime(plan.endTime);
    setEditingId(plan.id);
  }

  function deletePlan(id) {
    Alert.alert(
      'حذف برنامه',
      'آیا از حذف این برنامه مطمئن هستید؟',
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const newPlans = plans.filter((item) => item.id !== id);
            await persistPlans(newPlans);
            if (editingId === id) clearForm();
          },
        },
      ]
    );
  }

  const dayPlans = plans
    .filter((item) => item.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.loading}>در حال بارگذاری برنامه‌ها...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← بازگشت به صفحه اصلی</Text>
        </Pressable>

        <Text style={styles.title}>📅 برنامه‌ریز هفتگی</Text>
        <Text style={styles.subtitle}>
          برنامه مطالعه خود را برای روزهای هفته تنظیم کنید.
        </Text>

        <Text style={styles.sectionTitle}>انتخاب روز هفته</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysRow}
        >
          {days.map((day) => (
            <Pressable
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayButton,
                selectedDay === day && styles.dayButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDay === day && styles.dayTextActive,
                ]}
              >
                {day}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            {editingId ? 'ویرایش برنامه' : 'افزودن برنامه جدید'}
          </Text>

          <Text style={styles.label}>انتخاب درس</Text>

          <View style={styles.subjectGrid}>
            {subjects.map((item) => (
              <Pressable
                key={item.title}
                onPress={() => setSelectedSubject(item.title)}
                style={[
                  styles.subjectButton,
                  selectedSubject === item.title &&
                    styles.subjectButtonActive,
                ]}
              >
                <Text style={styles.subjectText}>
                  {item.icon} {item.title}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>موضوع مطالعه</Text>
          <TextInput
            style={styles.input}
            value={topic}
            onChangeText={setTopic}
            placeholder="مثلاً فصل دوم، حل تمرین..."
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>ساعت شروع (مثلاً 08:30)</Text>
          <TextInput
            style={styles.input}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="08:30"
            placeholderTextColor="#999"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />

          <Text style={styles.label}>ساعت پایان (مثلاً 09:30)</Text>
          <TextInput
            style={styles.input}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="09:30"
            placeholderTextColor="#999"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />

          <Pressable style={styles.saveButton} onPress={savePlan}>
            <Text style={styles.saveButtonText}>
              {editingId ? 'ذخیره تغییرات' : '＋ ثبت برنامه'}
            </Text>
          </Pressable>

          {editingId ? (
            <Pressable style={styles.cancelButton} onPress={clearForm}>
              <Text style={styles.cancelText}>انصراف از ویرایش</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            برنامه‌های {selectedDay}
          </Text>
          <Text style={styles.countText}>
            {dayPlans.length} برنامه
          </Text>
        </View>

        {dayPlans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🗓️</Text>
            <Text style={styles.emptyText}>
              برای این روز هنوز برنامه‌ای ثبت نشده است.
            </Text>
          </View>
        ) : (
          dayPlans.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planTime}>
                <Text style={styles.timeText}>
                  {plan.startTime}
                </Text>
                <Text style={styles.timeDivider}>تا</Text>
                <Text style={styles.timeText}>
                  {plan.endTime}
                </Text>
              </View>

              <View style={styles.planInfo}>
                <Text style={styles.planSubject}>
                  {plan.subject}
                </Text>
                <Text style={styles.planTopic}>
                  {plan.topic}
                </Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={styles.editButton}
                  onPress={() => editPlan(plan)}
                >
                  <Text style={styles.actionText}>ویرایش</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deletePlan(plan.id)}
                >
                  <Text style={styles.actionText}>حذف</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <Text style={styles.footer}>
          برنامه‌ها روی همین دستگاه ذخیره می‌شوند.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  container: {
    padding: 18,
    paddingBottom: 40,
  },
  loading: {
    textAlign: 'center',
    marginTop: 40,
    color: '#555',
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
  },
  backText: {
    color: '#5267D9',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#20243A',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    textAlign: 'right',
    marginTop: 7,
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#20243A',
    textAlign: 'right',
    marginBottom: 12,
  },
  daysRow: {
    paddingBottom: 18,
    gap: 8,
  },
  dayButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7F0',
  },
  dayButtonActive: {
    backgroundColor: '#5267D9',
    borderColor: '#5267D9',
  },
  dayText: {
    color: '#555',
    fontWeight: 'bold',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 24,
    elevation: 2,
  },
  label: {
    color: '#30384A',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 14,
    marginBottom: 8,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectButton: {
    width: '32%',
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 11,
    backgroundColor: '#F4F5FA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF5',
  },
  subjectButtonActive: {
    backgroundColor: '#EEF0FF',
    borderColor: '#5267D9',
  },
  subjectText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#30384A',
  },
  input: {
    backgroundColor: '#F9FAFD',
    borderWidth: 1,
    borderColor: '#E3E5EC',
    borderRadius: 12,
    padding: 13,
    fontSize: 15,
    color: '#172033',
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#5267D9',
    padding: 16,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#777',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    color: '#5267D9',
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 35,
    marginBottom: 10,
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    lineHeight: 24,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 1,
  },
  planTime: {
    backgroundColor: '#EEF0FF',
    padding: 9,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 65,
  },
  timeText: {
    color: '#5267D9',
    fontWeight: 'bold',
    fontSize: 13,
  },
  timeDivider: {
    color: '#777',
    fontSize: 10,
    marginVertical: 2,
  },
  planInfo: {
    flex: 1,
  },
  planSubject: {
    color: '#20243A',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'right',
  },
  planTopic: {
    color: '#777',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  actions: {
    gap: 6,
  },
  editButton: {
    backgroundColor: '#E7ECFF',
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#FDECEC',
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#30384A',
  },
  footer: {
    textAlign: 'center',
    color: '#999',
    fontSize: 11,
    marginTop: 20,
  },
});
