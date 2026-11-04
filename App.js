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
                  <Text style={styles.subjectName}>
                    {item.icon} {item.title}
                  </Text>

                  <Text style={styles.subjectPercentage}>
                    {item.percentage}٪
                  </Text>
                </View>

                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.percentage}%` },
                    ]}
                  />
                </View>

                <View style={styles.subjectStats}>
                  <Text style={styles.statSmall}>
                    تست: {item.tests}
                  </Text>

                  <Text style={styles.activityCorrect}>
                    درست: {item.correct}
                  </Text>

                  <Text style={styles.activityWrong}>
                    غلط: {item.wrong}
                  </Text>

                  <Text style={styles.statSmall}>
                    نزده: {item.unanswered}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🕘 فعالیت‌های اخیر
            </Text>

            {activities.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  هنوز فعالیتی ثبت نکرده‌اید.
                </Text>
              </View>
            ) : (
              activities
                .slice()
                .reverse()
                .slice(0, 5)
                .map((item) => (
                  <View
                    key={item.id}
                    style={styles.activityCard}
                  >
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityIcon}>
                        {activityTypes.find(
                          (type) => type.id === item.type
                        )?.icon || '📌'}
                      </Text>

                      <Text style={styles.activityTitle}>
                        {activityTypes.find(
                          (type) => type.id === item.type
                        )?.title || 'فعالیت'}
                      </Text>

                      <Text style={styles.activityDate}>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('fa-IR')
                          : ''}
                      </Text>
                    </View>

                    <View style={styles.activityDetails}>
                      {item.type === 'study' && (
                        <>
                          <Text style={styles.activityDetail}>
                            <Text style={styles.activityLabel}>درس / موضوع: </Text>
                            {item.subject || 'ثبت نشده'}
                          </Text>

                          <Text style={styles.activityDetail}>
                            <Text style={styles.activityLabel}>مدت مطالعه: </Text>
                            {item.studyMinutes || '۰'} دقیقه
                          </Text>

                          {item.description ? (
                            <Text style={styles.activityDetail}>
                              <Text style={styles.activityLabel}>توضیحات: </Text>
                              {item.description}
                            </Text>
                          ) : null}
                        </>
                      )}

                      {(item.type === 'test' || item.type === 'exam') && (
                        <>
                          <Text style={styles.activityDetail}>
                            <Text style={styles.activityLabel}>درس: </Text>
                            {item.subject || 'ثبت نشده'}
                          </Text>

                          {item.type === 'exam' && (
                            <>
                              <Text style={styles.activityDetail}>
                                <Text style={styles.activityLabel}>نام آزمون: </Text>
                                {item.examName || 'ثبت نشده'}
                              </Text>

                              <Text style={styles.activityDetail}>
                                <Text style={styles.activityLabel}>تاریخ آزمون: </Text>
                                {item.examDate || 'ثبت نشده'}
                              </Text>

                              <Text style={styles.activityDetail}>
                                <Text style={styles.activityLabel}>نمره: </Text>
                                {item.examScore || 'ثبت نشده'}
                              </Text>
                            </>
                          )}

                          <Text style={styles.activityDetail}>
                            <Text style={styles.activityLabel}>تعداد سؤال: </Text>
                            {item.count || '۰'}
                          </Text>

                          <View style={styles.activityAnswerRow}>
                            <Text style={styles.activityCorrect}>
                              درست: {item.correct || '۰'}
                            </Text>

                            <Text style={styles.activityWrong}>
                              غلط: {item.wrong || '۰'}
                            </Text>
                          </View>

                          {item.description ? (
                            <Text style={styles.activityDetail}>
                              <Text style={styles.activityLabel}>توضیحات: </Text>
                              {item.description}
                            </Text>
                          ) : null}
                        </>
                      )}

                      {item.type === 'homework' && (
                        <>
                          <Text style={styles.activityDetail}>
                            <Text style={styles.activityLabel}>درس / موضوع: </Text>
                            {item.subject || 'ثبت نشده'}
                          </Text>

                          {item.description ? (
                            <Text style={styles.activityDetail}>
                              <Text style={styles.activityLabel}>شرح تکلیف: </Text>
                              {item.description}
                            </Text>
                          ) : null}
                        </>
                      )}

                      {item.type === 'goal' && (
                        <Text style={styles.activityDetail}>
                          <Text style={styles.activityLabel}>شرح هدف: </Text>
                          {item.description || item.subject || 'ثبت نشده'}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
            )}
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => setScreen('allActivities')}
          >
            <Text style={styles.secondaryButtonText}>
              مشاهده همه فعالیت‌ها
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function ActivityTypeScreen() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Pressable
            style={styles.backButton}
            onPress={() => setScreen('dashboard')}
          >
            <Text style={styles.backButtonText}>
              ← بازگشت
            </Text>
          </Pressable>

          <Text style={styles.pageTitle}>
            انتخاب نوع فعالیت
          </Text>

          <Text style={styles.pageSubtitle}>
            چه فعالیتی انجام داده‌اید؟
          </Text>

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

              <Text style={styles.typeArrow}>
                ←
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  function ActivityFormScreen() {
    const needsSubject =
      selectedType === 'test' || selectedType === 'exam';

    const selectedActivityTitle =
      activityTypes.find(
        (item) => item.id === selectedType
      )?.title || 'ثبت فعالیت';

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Pressable
            style={styles.backButton}
            onPress={() => setScreen('activityType')}
          >
            <Text style={styles.backButtonText}>
              ← بازگشت
            </Text>
          </Pressable>

          <Text style={styles.pageTitle}>
            ثبت {selectedActivityTitle}
          </Text>

          {needsSubject && (
            <>
              <Text style={styles.inputLabel}>
                انتخاب درس
              </Text>
<View style={styles.subjectGrid}>
  {subjects.map((item) => {
    const selected = selectedSubject === item.id;

    return (
      <Pressable
        key={item.id}
        style={[
          styles.subjectSelectCard,
          selected && styles.subjectSelectCardActive,
        ]}
        onPress={() => setSelectedSubject(item.id)}
      >
        <Text style={styles.subjectSelectIcon}>
          {item.icon}
        </Text>

        <Text
          style={[
            styles.subjectSelectText,
            selected && styles.subjectSelectTextActive,
          ]}
        >
          {item.title} {selected ? '✓' : ''}
        </Text>
      </Pressable>
    );
  })}
</View>

            </>
          )}

          {!needsSubject && (
            <>
              <Text style={styles.inputLabel}>
                درس یا موضوع
              </Text>

              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="نام درس یا موضوع را وارد کنید"
                placeholderTextColor="#999"
              />
            </>
          )}

          {needsSubject && (
            <>
              <Text style={styles.inputLabel}>
                تعداد سؤال
              </Text>

              <TextInput
                style={styles.input}
                value={count}
                onChangeText={setCount}
                keyboardType="numeric"
                placeholder="مثلاً ۲۰"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>
                تعداد پاسخ صحیح
              </Text>

              <TextInput
                style={styles.input}
                value={correct}
                onChangeText={setCorrect}
                keyboardType="numeric"
                placeholder="تعداد درست"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>
                تعداد پاسخ غلط
              </Text>

              <TextInput
                style={[styles.input, styles.wrongInput]}
                value={wrong}
                onChangeText={setWrong}
                keyboardType="numeric"
                placeholder="تعداد غلط"
                placeholderTextColor="#999"
              />
            </>
          )}
          {selectedType === 'study' && (
            <>
              <Text style={styles.inputLabel}>
                مدت مطالعه (دقیقه)
              </Text>

              <TextInput
                style={styles.input}
                value={studyTime}
                onChangeText={setStudyTime}
                keyboardType="numeric"
                placeholder="مثلاً ۶۰"
                placeholderTextColor="#999"
              />
            </>
          )}

          {selectedType === 'exam' && (
            <>
              <Text style={styles.inputLabel}>
                نام آزمون
              </Text>

              <TextInput
                style={styles.input}
                value={examName}
                onChangeText={setExamName}
                placeholder="نام آزمون را وارد کنید"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>
                تاریخ آزمون
              </Text>

              <TextInput
                style={styles.input}
                value={examDate}
                onChangeText={setExamDate}
                placeholder="مثلاً ۱۴۰۵/۰۸/۱۰"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>
                نمره آزمون
              </Text>

              <TextInput
                style={styles.input}
                value={examScore}
                onChangeText={setExamScore}
                keyboardType="numeric"
                placeholder="نمره"
                placeholderTextColor="#999"
              />
            </>
          )}

          <Text style={styles.inputLabel}>
            توضیحات
          </Text>

          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="توضیحات بیشتر را وارد کنید..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />

          <Pressable
            style={styles.primaryButton}
            onPress={saveActivity}
          >
            <Text style={styles.primaryButtonText}>
              ثبت فعالیت
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function AllActivitiesScreen() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Pressable
            style={styles.backButton}
            onPress={() => setScreen('dashboard')}
          >
            <Text style={styles.backButtonText}>
              ← بازگشت
            </Text>
          </Pressable>

          <Text style={styles.pageTitle}>
            همه فعالیت‌ها
          </Text>

          {activities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                هنوز فعالیتی ثبت نشده است.
              </Text>
            </View>
          ) : (
            activities
              .slice()
              .reverse()
              .map((item) => (
                <View
                  key={item.id}
                  style={styles.activityCard}
                >
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityIcon}>
                      {activityTypes.find(
                        (type) => type.id === item.type
                      )?.icon || '📌'}
                    </Text>

                    <Text style={styles.activityTitle}>
                      {activityTypes.find(
                        (type) => type.id === item.type
                      )?.title || 'فعالیت'}
                    </Text>

                    <Text style={styles.activityDate}>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('fa-IR')
                        : ''}
                    </Text>
                  </View>

                  <View style={styles.activityDetails}>
                    {item.subject ? (
                      <Text style={styles.activityDetail}>
                        <Text style={styles.activityLabel}>درس / موضوع: </Text>
                        {item.subject}
                      </Text>
                    ) : null}

                    {item.type === 'study' && (
                      <Text style={styles.activityDetail}>
                        <Text style={styles.activityLabel}>مدت مطالعه: </Text>
                        {item.studyMinutes || '۰'} دقیقه
                      </Text>
                    )}

                    {(item.type === 'test' || item.type === 'exam') && (
                      <>
                        {item.type === 'exam' && (
                          <>
                            <Text style={styles.activityDetail}>
                              <Text style={styles.activityLabel}>نام آزمون: </Text>
                              {item.examName || 'ثبت نشده'}
                            </Text>

                            <Text style={styles.activityDetail}>
                              <Text style={styles.activityLabel}>تاریخ آزمون: </Text>
                              {item.examDate || 'ثبت نشده'}
                            </Text>

                            <Text style={styles.activityDetail}>
                              <Text style={styles.activityLabel}>نمره: </Text>
                              {item.examScore || 'ثبت نشده'}
                            </Text>
                          </>
                        )}

                        <Text style={styles.activityDetail}>
                          <Text style={styles.activityLabel}>تعداد سؤال: </Text>
                          {item.count || '۰'}
                        </Text>

                        <View style={styles.activityAnswerRow}>
                          <Text style={styles.activityCorrect}>
                            درست: {item.correct || '۰'}
                          </Text>

                          <Text style={styles.activityWrong}>
                            غلط: {item.wrong || '۰'}
                          </Text>
                        </View>
                      </>
                    )}

                    {item.description ? (
                      <Text style={styles.activityDetail}>
                        <Text style={styles.activityLabel}>
                          {item.type === 'homework'
                            ? 'شرح تکلیف: '
                            : item.type === 'goal'
                            ? 'شرح هدف: '
                            : 'توضیحات: '}
                        </Text>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  function StatCard({ emoji, number, title }) {
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            در حال بارگذاری...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <>
      {screen === 'dashboard' && Dashboard()}

      {screen === 'activityType' && ActivityTypeScreen()}

      {screen === 'activityForm' && ActivityFormScreen()}

      {screen === 'allActivities' && AllActivitiesScreen()}
    </>
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

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#555',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#20243A',
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#E7ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconText: {
    fontSize: 25,
  },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5267D9',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  heroEmoji: {
    fontSize: 38,
    marginRight: 15,
  },

  heroTextContainer: {
    flex: 1,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  heroSubtitle: {
    color: '#E9ECFF',
    fontSize: 13,
    marginTop: 5,
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
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },

  statEmoji: {
    fontSize: 25,
    marginBottom: 8,
  },

  statNumber: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#27336F',
  },

  statTitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
  },

  primaryButton: {
    backgroundColor: '#5267D9',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  secondaryButton: {
    backgroundColor: '#E7ECFF',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
  },

  secondaryButtonText: {
    color: '#5267D9',
    fontSize: 15,
    fontWeight: 'bold',
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#20243A',
    marginBottom: 12,
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
  },

  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  activityDetails: {
    width: '100%',
    marginTop: 4,
  },

  activityLabel: {
    fontWeight: '800',
    color: '#30384A',
  },

  activityCorrect: {
    color: '#2E9B68',
    fontWeight: '800',
  },

  activityWrong: {
    color: '#D32F2F',
    fontWeight: '800',
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