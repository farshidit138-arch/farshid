import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@hamrah_danesh_activities';

const subjects = [
  { id: 'biology', title: 'زیست', icon: '🧬' },
  { id: 'physics', title: 'فیزیک', icon: '⚡' },
  { id: 'chemistry', title: 'شیمی', icon: '🧪' },
  { id: 'math', title: 'ریاضی', icon: '📐' },
  { id: 'literature', title: 'ادبیات', icon: '📖' },
  { id: 'arabic', title: 'عربی', icon: '📝' },
  { id: 'english', title: 'زبان', icon: '🌍' },
  { id: 'religion', title: 'دینی', icon: '📚' },
];

const activityTypes = [
  { id: 'test', icon: '🧬', title: 'تست' },
  { id: 'study', icon: '📚', title: 'مطالعه' },
  { id: 'homework', icon: '📝', title: 'تکلیف' },
  { id: 'exam', icon: '🧪', title: 'آزمون' },
  { id: 'goal', icon: '🎯', title: 'هدف شخصی' },
];

export default function App() {
  const [screen, setScreen] = useState('dashboard');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subject, setSubject] = useState('');
  const [count, setCount] = useState('');
  const [correct, setCorrect] = useState('');
  const [wrong, setWrong] = useState('');
  const [studyTime, setStudyTime] = useState('');
  const [description, setDescription] = useState('');
const [examName, setExamName] = useState('');
const [examDate, setExamDate] = useState('');
const [examScore, setExamScore] = useState('');
  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const savedActivities = await AsyncStorage.getItem(STORAGE_KEY);

      if (savedActivities) {
        const parsed = JSON.parse(savedActivities);
        setActivities(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.log('خطا در خواندن اطلاعات:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveActivities(newActivities) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newActivities)
      );
      return true;
    } catch (error) {
      console.log('خطا در ذخیره اطلاعات:', error);
      return false;
    }
  }

  function resetForm() {
    setSelectedType(null);
    setSelectedSubject(null);
    setSubject('');
    setCount('');
    setCorrect('');
    setWrong('');
    setStudyTime('');
    setDescription('');
setExamName('');
setExamDate('');
setExamScore('');
  }

  async function saveActivity() {
    if (!selectedType) {
      Alert.alert('ثبت فعالیت', 'نوع فعالیت را انتخاب کنید.');
      return;
    }

    const needsSubject =
      selectedType === 'test' || selectedType === 'exam';

    if (needsSubject && !selectedSubject) {
      Alert.alert(
        'انتخاب درس',
        'لطفاً ابتدا درس موردنظر را انتخاب کنید.'
      );
      return;
    }

    if (needsSubject && !count.trim()) {
      Alert.alert(
        'تعداد سؤال',
        'لطفاً تعداد سؤال را وارد کنید.'
      );
      return;
    }

    const selectedSubjectTitle =
      subjects.find(
        (item) => item.id === selectedSubject
      )?.title || '';

    const newActivity = {
      id: Date.now().toString(),
      type: selectedType,
      subject: needsSubject
        ? selectedSubjectTitle
        : subject.trim(),
      count: count.trim(),
      correct: correct.trim(),
      wrong: wrong.trim(),
      studyMinutes: studyTime.trim(),
      description: description.trim(),
examName: examName.trim(),
examDate: examDate.trim(),
examScore: examScore.trim(),
      createdAt: new Date().toISOString(),
    };

    const newActivities = [
      ...activities,
      newActivity,
    ];

    const saved = await saveActivities(newActivities);

    if (!saved) {
      Alert.alert(
        'خطا',
        'ثبت فعالیت انجام نشد. دوباره تلاش کنید.'
      );
      return;
    }

    setActivities(newActivities);
    resetForm();
    setScreen('dashboard');
  }
  const totalTests = activities
    .filter((item) => item.type === 'test')
    .reduce(
      (sum, item) => sum + Number(item.count || 0),
      0
    );

  const totalStudyMinutes = activities
    .filter((item) => item.type === 'study')
    .reduce(
      (sum, item) =>
        sum + Number(item.studyMinutes || 0),
      0
    );

  const totalHomework = activities.filter(
    (item) => item.type === 'homework'
  ).length;

  const totalExams = activities.filter(
    (item) => item.type === 'exam'
  ).length;

  const subjectStats = subjects.map((subjectItem) => {
    const subjectActivities = activities.filter(
      (item) =>
        item.type === 'test' &&
        item.subject === subjectItem.title
    );

    const tests = subjectActivities.reduce(
      (sum, item) =>
        sum + Number(item.count || 0),
      0
    );

    const correct = subjectActivities.reduce(
      (sum, item) =>
        sum + Number(item.correct || 0),
      0
    );

    const wrong = subjectActivities.reduce(
      (sum, item) =>
        sum + Number(item.wrong || 0),
      0
    );

    const unanswered = Math.max(
      tests - correct - wrong,
      0
    );

    const percentage =
      tests > 0
        ? Math.round((correct / tests) * 100)
        : 0;

    return {
      ...subjectItem,
      tests,
      correct,
      wrong,
      unanswered,
      percentage,
    };
  });

  function Dashboard() {
    const hours = Math.floor(
      totalStudyMinutes / 60
    );

    const minutes = totalStudyMinutes % 60;

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                سلام 👋
              </Text>

              <Text style={styles.subtitle}>
                امروز چطوری؟
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>
                🎓
              </Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroEmoji}>
              📚
            </Text>

            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>
                همراه‌دانش
              </Text>

              <Text style={styles.heroSubtitle}>
                همراه همیشگی مسیر یادگیری تو
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              emoji="🧬"
              number={totalTests}
              title="تعداد تست"
            />

            <StatCard
              emoji="⏱️"
              number={
                hours > 0
                  ? `${hours}س ${minutes}د`
                  : `${minutes}د`
              }
              title="زمان مطالعه"
            />

            <StatCard
              emoji="📝"
              number={totalHomework}
              title="تکالیف"
            />

            <StatCard
              emoji="🧪"
              number={totalExams}
              title="آزمون‌ها"
            />
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              setScreen('activityType')
            }
          >
            <Text style={styles.primaryButtonText}>
              ＋ ثبت فعالیت
            </Text>
          </Pressable>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📚 عملکرد دروس
            </Text>

            {subjectStats.map((item) => (
              <View
                key={item.id}
                style={styles.subjectCard}
              >
                <View style={styles.subjectHeader}>
                  <View style={styles.subjectNameRow}>
                    <Text style={styles.subjectIcon}>
                      {item.icon}
                    </Text>

                    <Text style={styles.subjectTitle}>
                      {item.title}
                    </Text>
                  </View>

                  <Text style={styles.subjectPercentage}>
                    {item.percentage}٪
                  </Text>
                </View>

                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${item.percentage}%`,
                      },
                    ]}
                  />
                </View>

                <View style={styles.subjectNumbers}>
                  <Text style={styles.numberCorrect}>
                    درست: {item.correct}
                  </Text>

                  <Text style={styles.numberWrong}>
                    غلط: {item.wrong}
                  </Text>

                  <Text style={styles.numberUnanswered}>
                    نزده: {item.unanswered}
                  </Text>

                  <Text style={styles.numberTests}>
                    تست: {item.tests}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {activities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                🕘 فعالیت‌های اخیر
              </Text>

              {activities
                .slice()
                .reverse()
                .slice(0, 5)
                .map((item) => (
                  <View
                    key={item.id}
                    style={styles.activityCard}
                  >
                    <Text style={styles.activityIcon}>
                      {item.type === 'test'
                        ? '🧬'
                        : item.type === 'study'
                        ? '📚'
                        : item.type === 'homework'
                        ? '📝'
                        : item.type === 'exam'
                        ? '🧪'
                        : '🎯'}
                    </Text>

                    <View
                      style={styles.activityInfo}
                    >
                      <Text
                        style={
                          styles.activityTitle
                        }
                      >
                        {item.type === 'test'
                          ? 'تست'
                          : item.type === 'study'
                          ? 'مطالعه'
                          : item.type ===
                            'homework'
                          ? 'تکلیف'
                          : item.type ===
                            'exam'
                          ? 'آزمون'
                          : 'هدف شخصی'}
                      </Text>

                      {item.subject ? (
                        <Text
                          style={
                            styles.activitySubject
                          }
                        >
                          {item.subject}
                        </Text>
                      ) : null}
                    </View>

                    {item.type === 'test' && (
                      <Text
                        style={
                          styles.activityCount
                        }
                      >
                        {item.count || 0} تست
                      </Text>
                    )}
                  </View>
                ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
  function ActivityType() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
        >
          <View style={styles.pageHeader}>
            <Pressable
              onPress={() => setScreen('dashboard')}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>
                → بازگشت
              </Text>
            </Pressable>

            <Text style={styles.pageTitle}>
              ثبت فعالیت
            </Text>

            <Text style={styles.pageSubtitle}>
              نوع فعالیت خود را انتخاب کنید
            </Text>
          </View>

          <View style={styles.typeGrid}>
            {activityTypes.map((item) => (
              <Pressable
                key={item.id}
                style={styles.typeCard}
                onPress={() => {
                  setSelectedType(item.id);
                  setScreen('activityForm');
                }}
              >
                <Text style={styles.typeIcon}>
                  {item.icon}
                </Text>

                <Text style={styles.typeTitle}>
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function ActivityForm() {
    const isTest =
      selectedType === 'test' ||
      selectedType === 'exam';

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
        >
          <View style={styles.pageHeader}>
            <Pressable
              onPress={() =>
                setScreen('activityType')
              }
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>
                → بازگشت
              </Text>
            </Pressable>

            <Text style={styles.pageTitle}>
              {selectedType === 'test'
                ? 'ثبت تست'
                : selectedType === 'study'
                ? 'ثبت مطالعه'
                : selectedType ===
                  'homework'
                ? 'ثبت تکلیف'
                : selectedType === 'exam'
                ? 'ثبت آزمون'
                : 'ثبت هدف شخصی'}
            </Text>
          </View>

          {isTest && (
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>
                درس
              </Text>

              <View style={styles.subjectGrid}>
                {subjects.map((item) => {
                  const selected =
                    selectedSubject === item.id;

                  return (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.subjectSelectCard,
                        selected &&
                          styles.subjectSelectCardActive,
                      ]}
                      onPress={() =>
                        setSelectedSubject(
                          item.id
                        )
                      }
                    >
                      <Text
                        style={
                          styles.subjectSelectIcon
                        }
                      >
                        {item.icon}
                      </Text>

                      <Text
                        style={[
                          styles.subjectSelectText,
                          selected &&
                            styles.subjectSelectTextActive,
                        ]}
                      >
                        {item.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
{selectedType === 'exam' && (
  <>
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>
        نام آزمون
      </Text>
      <TextInput
        style={styles.input}
        value={examName}
        onChangeText={setExamName}
        placeholder="مثلاً آزمون آزمایشی مهر"
        placeholderTextColor="#999"
      />
    </View>

    <View style={styles.formSection}>
      <Text style={styles.formLabel}>
        تاریخ آزمون
      </Text>
      <TextInput
        style={styles.input}
        value={examDate}
        onChangeText={setExamDate}
        placeholder="مثلاً ۱۴۰۵/۰۸/۱۰"
        placeholderTextColor="#999"
      />
    </View>

    <View style={styles.formSection}>
      <Text style={styles.formLabel}>
        نمره کسب‌شده
      </Text>
      <TextInput
        style={styles.input}
        value={examScore}
        onChangeText={setExamScore}
        placeholder="مثلاً ۸۵ از ۱۰۰"
        placeholderTextColor="#999"
      />
    </View>
  </>
)}
          {!isTest &&
            selectedType !== 'goal' && (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>
                  عنوان / درس
                </Text>

                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="مثلاً زیست یا فصل سوم"
                  placeholderTextColor="#999"
                />
              </View>
            )}

          {isTest && (
            <>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>
                  تعداد سؤال
                </Text>

                <TextInput
                  style={styles.input}
                  value={count}
                  onChangeText={setCount}
                  placeholder="مثلاً ۳۰"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text
                    style={styles.formLabel}
                  >
                    درست
                  </Text>

                  <TextInput
                    style={[
                      styles.input,
                      styles.correctInput,
                    ]}
                    value={correct}
                    onChangeText={setCorrect}
                    placeholder="مثلاً ۲۲"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formHalf}>
                  <Text
                    style={styles.formLabel}
                  >
                    غلط
                  </Text>

                  <TextInput
                    style={[
                      styles.input,
                      styles.wrongInput,
                    ]}
                    value={wrong}
                    onChangeText={setWrong}
                    placeholder="مثلاً ۵"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </>
          )}

          {selectedType === 'study' && (
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>
                مدت مطالعه به دقیقه
              </Text>

              <TextInput
                style={styles.input}
                value={studyTime}
                onChangeText={setStudyTime}
                placeholder="مثلاً ۹۰"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>
              توضیحات
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.textArea,
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="توضیحات اختیاری..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <Pressable
            style={styles.saveButton}
            onPress={saveActivity}
          >
            <Text style={styles.saveButtonText}>
              ✓ ثبت فعالیت
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.loadingText}>
          در حال آماده‌سازی همراه‌دانش...
        </Text>
      </SafeAreaView>
    );
  }

  if (screen === 'activityType') {
    return <ActivityType />;
  }

  if (screen === 'activityForm') {
    return <ActivityForm />;
  }

  return <Dashboard />;
}

function StatCard({
  emoji,
  number,
  title,
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>
        {emoji}
      </Text>

      <Text style={styles.statNumber}>
        {number}
      </Text>

      <Text style={styles.statTitle}>
        {title}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8FC',
  },

  loadingText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#172033',
    textAlign: 'right',
  },

  subtitle: {
    fontSize: 15,
    color: '#777',
    marginTop: 5,
    textAlign: 'right',
  },

  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconText: {
    fontSize: 28,
  },

  heroCard: {
    backgroundColor: '#5967E8',
    borderRadius: 22,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  heroEmoji: {
    fontSize: 42,
    marginRight: 15,
  },

  heroTextContainer: {
    flex: 1,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'right',
  },

  heroSubtitle: {
    color: '#E9EBFF',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'right',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  statEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#172033',
  },

  statTitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
  },

  primaryButton: {
    backgroundColor: '#5967E8',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 25,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 14,
    textAlign: 'right',
  },

  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  subjectNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subjectIcon: {
    fontSize: 25,
    marginRight: 8,
  },

  subjectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172033',
  },

  subjectPercentage: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5967E8',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#ECEEF5',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 12,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#5967E8',
    borderRadius: 10,
  },

  subjectNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  numberCorrect: {
    color: '#2E9B68',
    fontSize: 12,
    fontWeight: '600',
  },

  numberWrong: {
    color: '#D9534F',
    fontSize: 12,
    fontWeight: '600',
  },

  numberUnanswered: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },

  numberTests: {
    color: '#5967E8',
    fontSize: 12,
    fontWeight: '600',
  },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  activityIcon: {
    fontSize: 26,
    marginRight: 12,
  },

  activityInfo: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172033',
    textAlign: 'right',
  },

  activitySubject: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
    textAlign: 'right',
  },

  activityCount: {
    fontSize: 13,
    color: '#5967E8',
    fontWeight: '700',
  },

  pageHeader: {
    marginBottom: 25,
  },

  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 18,
  },

  backButtonText: {
    color: '#5967E8',
    fontSize: 14,
    fontWeight: '700',
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#172033',
    textAlign: 'right',
  },

  pageSubtitle: {
    color: '#777',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'right',
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  typeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    marginBottom: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  typeIcon: {
    fontSize: 38,
    marginBottom: 12,
  },

  typeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172033',
  },

  formSection: {
    marginBottom: 20,
  },

  formLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 9,
    textAlign: 'right',
  },

  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  subjectSelectCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#ECEEF5',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },

  subjectSelectCardActive: {
    borderColor: '#5967E8',
    backgroundColor: '#EEF0FF',
  },

  subjectSelectIcon: {
    fontSize: 28,
    marginBottom: 7,
  },

  subjectSelectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
  },

  subjectSelectTextActive: {
    color: '#5967E8',
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E5EC',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 16,
    color: '#172033',
    textAlign: 'right',
  },

  correctInput: {
    borderColor: '#A9D9C2',
  },

  wrongInput: {
    borderColor: '#F0B0AD',
  },

  textArea: {
    minHeight: 110,
  },

  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  formHalf: {
    width: '48%',
  },

  saveButton: {
    backgroundColor: '#2E9B68',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 30,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});