import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Linking,
  Switch,
  FlatList,
  Dimensions,
  Platform,
  I18nManager,
  Animated,
  Easing,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";

const { width } = Dimensions.get("window");

// Colors - Blue, White, Dark Gray - Professional Security
const COLORS = {
  primary: "#0A3D62",
  primaryLight: "#1E6CB0",
  primaryBright: "#2196F3",
  primarySoft: "#E3F2FD",
  primaryMuted: "#BBDEFB",
  accent: "#00C853",
  accentLight: "#E8F5E9",
  danger: "#E53935",
  dangerLight: "#FFEBEE",
  warning: "#FF8F00",
  warningLight: "#FFF8E1",
  dark: "#121C2B",
  dark2: "#1E2E45",
  dark3: "#2A3A52",
  gray900: "#1A2332",
  gray700: "#3E4A5C",
  gray500: "#7A8699",
  gray300: "#D0D9E6",
  gray100: "#F1F5F9",
  gray50: "#F8FAFC",
  white: "#FFFFFF",
  cardShadow: "rgba(10,61,98,0.08)",
};

const PHONE = "+967781008103";

// Prevent RTL flip issues - ensure Arabic layout
try {
  // @ts-ignore
  if (!I18nManager.isRTL) {
    I18nManager.allowRTL(true);
  }
} catch {}

// --- Components ---

function CircularProtection({
  percent,
  status,
  size = 210,
}: {
  percent: number;
  status: "safe" | "threat" | "scanning";
  size?: number;
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percent,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    const id = animatedValue.addListener(({ value }) =>
      setDisplayPercent(Math.round(value))
    );
    return () => animatedValue.removeListener(id);
  }, [percent]);

  useEffect(() => {
    if (status === "scanning") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  const strokeW = 10;
  const r = (size - strokeW * 2) / 2 - 8;
  const circ = 2 * Math.PI * r;
  const progress = circ - (circ * displayPercent) / 100;

  const color =
    status === "safe" ? COLORS.accent : status === "threat" ? COLORS.danger : COLORS.primaryBright;
  const bg = status === "safe" ? COLORS.accentLight : status === "threat" ? COLORS.dangerLight : COLORS.primarySoft;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: pulseAnim }],
          shadowColor: color,
          shadowOpacity: 0.18,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        {/* SVG-like circle using borders */}
        <View
          style={{
            position: "absolute",
            width: size - 18,
            height: size - 18,
            borderRadius: (size - 18) / 2,
            borderWidth: strokeW,
            borderColor: "rgba(0,0,0,0.06)",
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size - 18,
            height: size - 18,
            borderRadius: (size - 18) / 2,
            borderWidth: strokeW,
            borderColor: color,
            borderLeftColor: displayPercent < 25 ? "transparent" : color,
            borderBottomColor:
              displayPercent < 50 ? "transparent" : color,
            borderRightColor: displayPercent < 75 ? "transparent" : color,
            opacity: 0.95,
            transform: [{ rotate: "-90deg" }],
          }}
        />
        {/* inner white card */}
        <View
          style={{
            width: size - 46,
            height: size - 46,
            borderRadius: (size - 46) / 2,
            backgroundColor: COLORS.white,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: bg,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}
          >
            <Ionicons
              name={
                status === "safe"
                  ? "shield-checkmark"
                  : status === "threat"
                  ? "warning"
                  : "scan"
              }
              size={30}
              color={color}
            />
          </View>
          <Text style={{ fontSize: 34, fontWeight: "900", color: COLORS.dark, letterSpacing: -1 }}>
            {status === "scanning" ? `${displayPercent}%` : `${percent}%`}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "800",
              color: color,
              letterSpacing: 1,
              marginTop: 2,
            }}
          >
            {status === "safe"
              ? "محمي بالكامل"
              : status === "threat"
              ? "خطر محتمل"
              : "جاري الفحص"}
          </Text>
        </View>
      </Animated.View>

      {/* status badge */}
      <View
        style={{
          marginTop: 14,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: COLORS.white,
          paddingHorizontal: 14,
          paddingVertical: 7,
          borderRadius: 100,
          borderWidth: 1,
          borderColor: status === "safe" ? COLORS.accent + "30" : COLORS.danger + "30",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
            marginLeft: 7,
          }}
        />
        <Text style={{ fontSize: 12, fontWeight: "800", color: COLORS.gray700 }}>
          {status === "safe"
            ? "جهازك محمي بنجاح ✓"
            : status === "threat"
            ? "يوجد تهديد يحتاج معالجة"
            : "جاري فحص النظام..."}
        </Text>
      </View>
    </View>
  );
}

// --- Screens ---

function DashboardScreen({ navigation }: any) {
  const [protection, setProtection] = useState(96);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan] = useState("منذ 12 دقيقة");
  const [threatsBlocked] = useState(23);
  const [storageCleaned] = useState("1.2GB");

  const handleQuickScan = () => {
    setIsScanning(true);
    navigation.navigate("الفحص", { autoStart: true });
    setTimeout(() => setIsScanning(false), 1500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray50 }} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.logoBox}>
              <Ionicons name="shield" size={22} color={COLORS.white} />
            </View>
            <View style={{ marginRight: 10 }}>
              <Text style={styles.brandTitle}>حماية ابن الهاشمي</Text>
              <Text style={styles.brandSub}>Ibn Al-Hashimi Protection • v3.2.1</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://wa.me/${PHONE.replace("+", "")}`)}
              style={styles.headerIcon}
            >
              <Ionicons name="logo-whatsapp" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("الإعدادات")} style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
              <View style={styles.dot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Circular Gauge Card */}
        <View style={styles.dashboardCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, width: "100%" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time-outline" size={14} color={COLORS.gray500} />
              <Text style={{ fontSize: 11, color: COLORS.gray500, marginRight: 5, fontWeight: "600" }}>
                آخر فحص: {lastScan}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: COLORS.accentLight,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 100,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent, marginLeft: 5 }} />
              <Text style={{ fontSize: 10, fontWeight: "800", color: COLORS.accent }}>نشط الآن</Text>
            </View>
          </View>

          <CircularProtection percent={protection} status="safe" />

          <TouchableOpacity onPress={handleQuickScan} activeOpacity={0.9} style={styles.scanBtn}>
            <Ionicons name="scan-outline" size={22} color={COLORS.white} style={{ marginLeft: 8 }} />
            <Text style={styles.scanBtnText}>فحص سريع للجهاز</Text>
            <Text style={styles.scanBtnSub}>Quick Scan</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 11, color: COLORS.gray500, marginTop: 8, fontWeight: "500" }}>
            فحص شامل للتطبيقات والملفات والذاكرة خلال 30 ثانية
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primarySoft }]}>
              <Ionicons name="bug-outline" size={18} color={COLORS.primaryBright} />
            </View>
            <Text style={styles.statNum}>{threatsBlocked}</Text>
            <Text style={styles.statLabel}>تهديد تم حظره</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.warningLight }]}>
              <Ionicons name="trash-outline" size={18} color={COLORS.warning} />
            </View>
            <Text style={styles.statNum}>{storageCleaned}</Text>
            <Text style={styles.statLabel}>تم تنظيفها</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.accentLight }]}>
              <Ionicons name="apps-outline" size={18} color={COLORS.accent} />
            </View>
            <Text style={styles.statNum}>14</Text>
            <Text style={styles.statLabel}>تطبيق محمي</Text>
          </View>
        </View>

        {/* Features Grid */}
        <Text style={styles.sectionTitle}>أدوات الحماية</Text>
        <View style={styles.grid}>
          {[
            {
              icon: "shield-checkmark",
              color: COLORS.primaryBright,
              bg: COLORS.primarySoft,
              title: "فحص الفيروسات",
              desc: "فحص التطبيقات والملفات",
              badge: "مُفعل",
              onPress: () => navigation.navigate("الفحص"),
            },
            {
              icon: "brush",
              color: "#7C3AED",
              bg: "#EDE9FE",
              title: "تنظيف المهملات",
              desc: "تسريع الجهاز 43%",
              badge: "1.2GB",
              onPress: () => navigation.navigate("التنظيف"),
            },
            {
              icon: "globe",
              color: COLORS.accent,
              bg: COLORS.accentLight,
              title: "حماية التصفح",
              desc: "حظر المواقع المشبوهة",
              badge: "نشط",
              onPress: () => navigation.navigate("الحماية"),
            },
            {
              icon: "lock-closed",
              color: COLORS.warning,
              bg: COLORS.warningLight,
              title: "قفل التطبيقات",
              desc: "حماية بصمة / رمز",
              badge: "14",
              onPress: () => navigation.navigate("الحماية", { tab: "lock" }),
            },
          ].map((f, i) => (
            <TouchableOpacity key={i} onPress={f.onPress} activeOpacity={0.85} style={styles.featureCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                  <Ionicons name={f.icon as any} size={22} color={f.color} />
                </View>
                <View
                  style={{
                    backgroundColor: f.bg,
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 100,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "800", color: f.color }}>{f.badge}</Text>
                </View>
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: f.color }}>فتح</Text>
                <Ionicons name="chevron-back" size={12} color={f.color} style={{ marginRight: 3 }} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pro Card */}
        <View style={styles.proCard}>
          <View style={styles.proGlow} />
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="diamond" size={12} color="#FFD54F" style={{ marginLeft: 4 }} />
                <Text style={{ color: "#FFD54F", fontSize: 10, fontWeight: "800" }}>نسخة PRO</Text>
              </View>
            </View>
            <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: "900", marginTop: 8, textAlign: "right" }}>
              ترقية لنظام الحماية المتقدم
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.78)", fontSize: 12, marginTop: 4, lineHeight: 17, textAlign: "right" }}>
              حماية لحظية، حظر إعلانات، دعم فني 24/7 وتحديثات يومية
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://wa.me/${PHONE.replace("+", "")}?text=مرحبا%20أريد%20الاشتراك%20في%20نظام%20حماية%20ابن%20الهاشمي%20PRO`)}
                style={styles.proBtn}
              >
                <Ionicons name="logo-whatsapp" size={16} color={COLORS.white} style={{ marginLeft: 6 }} />
                <Text style={{ color: COLORS.white, fontWeight: "800", fontSize: 12 }}>واتساب</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${PHONE}`)} style={styles.proBtnOutline}>
                <Ionicons name="call" size={14} color={COLORS.white} style={{ marginLeft: 5 }} />
                <Text style={{ color: COLORS.white, fontWeight: "800", fontSize: 12 }}>اتصال</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.proIconWrap}>
            <Ionicons name="shield" size={42} color={COLORS.white} />
            <View style={styles.proCheck}>
              <Ionicons name="checkmark" size={14} color={COLORS.primary} />
            </View>
          </View>
        </View>

        {/* Threat Feed */}
        <Text style={styles.sectionTitle}>سجل الحماية الأخير</Text>
        <View style={styles.timelineCard}>
          {[
            { icon: "checkmark-circle", color: COLORS.accent, title: "تم فحص 127 تطبيق", time: "اليوم 09:42 ص", desc: "لا توجد تهديدات" },
            { icon: "warning", color: COLORS.warning, title: "تم حظر موقع مشبوه", time: "أمس 11:20 م", desc: "phish-example.net" },
            { icon: "trash", color: "#7C3AED", title: "تم تنظيف 342 ملف مؤقت", time: "أمس 03:15 م", desc: "تم توفير 890MB" },
          ].map((item, idx) => (
            <View key={idx} style={[styles.timelineRow, idx !== 2 && { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 }]}>
              <View style={[styles.timelineIcon, { backgroundColor: item.color + "18" }]}>
                <Ionicons name={item.icon as any} size={16} color={item.color} />
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ fontWeight: "800", fontSize: 13, color: COLORS.dark, textAlign: "right" }}>{item.title}</Text>
                <Text style={{ fontSize: 11, color: COLORS.gray500, marginTop: 2, textAlign: "right" }}>{item.desc}</Text>
              </View>
              <Text style={{ fontSize: 10, color: COLORS.gray500, fontWeight: "600" }}>{item.time}</Text>
            </View>
          ))}
        </View>

        <View style={{ alignItems: "center", marginTop: 14, flexDirection: "row", justifyContent: "center" }}>
          <Ionicons name="lock-closed" size={12} color={COLORS.gray500} />
          <Text style={{ fontSize: 10, color: COLORS.gray500, marginRight: 5 }}>محمي بواسطة تشفير AES-256 • ابن الهاشمي</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ScanScreen({ route }: any) {
  const autoStart = route?.params?.autoStart;
  const [stage, setStage] = useState<"idle" | "scanning" | "result">("idle");
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("الاستعداد للفحص...");
  const [threats, setThreats] = useState<any[]>([]);
  const [scannedCount, setScannedCount] = useState(0);
  const scanInterval = useRef<any>(null);

  const files = [
    "فحص التطبيقات المثبتة (87)...",
    "فحص الذاكرة الداخلية...",
    "فحص ملفات النظام...",
    "فحص بطاقة SD...",
    "فحص شبكة الواي فاي...",
    "تحليل سلوك التطبيقات...",
    "فحص الأذونات الخطيرة...",
    "التحقق من التحديثات الأمنية...",
  ];

  const startScan = () => {
    setStage("scanning");
    setProgress(0);
    setScannedCount(0);
    setThreats([]);
    let p = 0;
    let idx = 0;
    scanInterval.current = setInterval(() => {
      p += Math.random() * 9 + 3;
      if (p >= 100) {
        p = 100;
        clearInterval(scanInterval.current);
        setProgress(100);
        setCurrentFile("اكتمل الفحص");
        setTimeout(() => {
          // simulate 1 threat found sometimes
          const found = Math.random() > 0.6;
          if (found) {
            setThreats([
              { name: "Adware.Generic.123", app: "تطبيق مشبوه: Fast Cleaner Pro", level: "متوسط", icon: "warning" },
            ]);
          } else {
            setThreats([]);
          }
          setStage("result");
        }, 500);
      } else {
        setProgress(Math.round(p));
        setScannedCount(Math.round((p / 100) * 3247));
        if (idx < files.length) {
          setCurrentFile(files[idx]);
          if (p > (idx + 1) * 12) idx++;
        }
      }
    }, 180);
  };

  useEffect(() => {
    if (autoStart) startScan();
    return () => clearInterval(scanInterval.current);
  }, [autoStart]);

  const cancelScan = () => {
    clearInterval(scanInterval.current);
    setStage("idle");
    setProgress(0);
  };

  if (stage === "idle") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray50 }} edges={["top"]}>
        <View style={styles.innerHeader}>
          <View>
            <Text style={styles.innerTitle}>فحص الفيروسات</Text>
            <Text style={styles.innerSub}>حماية شاملة من البرمجيات الخبيثة</Text>
          </View>
          <View style={[styles.innerIcon, { backgroundColor: COLORS.primarySoft }]}>
            <Ionicons name="scan" size={22} color={COLORS.primary} />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
          <View style={styles.scanIdleCard}>
            <CircularProtection percent={0} status="scanning" size={170} />
            <Text style={{ fontSize: 15, fontWeight: "900", color: COLORS.dark, marginTop: 18 }}>جاهز للفحص الشامل</Text>
            <Text style={{ fontSize: 12, color: COLORS.gray500, textAlign: "center", marginTop: 6, lineHeight: 18 }}>
              سيتم فحص جميع التطبيقات والملفات والذاكرة {"\n"}وكشف الفيروسات والبرمجيات الإعلانية
            </Text>
            <TouchableOpacity onPress={startScan} style={[styles.scanBtn, { marginTop: 18, width: "100%" }]}>
              <Ionicons name="play" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
              <Text style={styles.scanBtnText}>بدء الفحص الآن</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12, width: "100%" }}>
              <View style={styles.scanOptCard}>
                <Ionicons name="phone-portrait-outline" size={18} color={COLORS.primaryBright} />
                <Text style={styles.scanOptText}>فحص سريع</Text>
                <Text style={styles.scanOptSub}>30 ثانية</Text>
              </View>
              <View style={styles.scanOptCard}>
                <Ionicons name="layers-outline" size={18} color={COLORS.accent} />
                <Text style={styles.scanOptText}>فحص عميق</Text>
                <Text style={styles.scanOptSub}>3 دقائق</Text>
              </View>
              <View style={styles.scanOptCard}>
                <Ionicons name="folder-outline" size={18} color={COLORS.warning} />
                <Text style={styles.scanOptText}>مجلد مخصص</Text>
                <Text style={styles.scanOptSub}>اختياري</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoNum}>3,247</Text>
              <Text style={styles.infoLabel}>ملف سيتم فحصه</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoNum}>87</Text>
              <Text style={styles.infoLabel}>تطبيق مثبت</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoNum}>100%</Text>
              <Text style={styles.infoLabel}>قاعدة بيانات محدثة</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (stage === "scanning") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }} edges={["top"]}>
        <View style={styles.innerHeader}>
          <View>
            <Text style={styles.innerTitle}>جاري الفحص...</Text>
            <Text style={styles.innerSub}>لا تغلق التطبيق أثناء الفحص</Text>
          </View>
          <TouchableOpacity onPress={cancelScan} style={[styles.innerIcon, { backgroundColor: COLORS.dangerLight }]}>
            <Ionicons name="close" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, padding: 20, alignItems: "center" }}>
          <CircularProtection percent={progress} status="scanning" size={190} />

          <View style={{ width: "100%", marginTop: 22 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: COLORS.primary }}>{progress}%</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.gray700 }}>{scannedCount.toLocaleString("ar-EG")} ملف</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.scanFileRow}>
              <Ionicons name="document-text-outline" size={14} color={COLORS.primaryBright} />
              <Text style={{ fontSize: 12, color: COLORS.gray700, marginRight: 6, flex: 1, textAlign: "right" }} numberOfLines={1}>
                {currentFile}
              </Text>
              <View style={styles.scanPulse} />
            </View>
          </View>

          <View style={{ width: "100%", marginTop: 18, backgroundColor: COLORS.gray50, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.gray100 }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: COLORS.gray700, textAlign: "right", marginBottom: 8 }}>جاري فحص:</Text>
            {["WhatsApp", "Facebook", "Gallery", "SystemUI", "Downloads"].slice(0, 3).map((a, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, opacity: i === 0 ? 1 : 0.55 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.gray100 }}>
                  <Ionicons name="apps" size={14} color={COLORS.primary} />
                </View>
                <Text style={{ flex: 1, textAlign: "right", marginRight: 8, fontSize: 12, fontWeight: "600", color: COLORS.dark }}>{a}</Text>
                <Ionicons name={i === 0 ? "sync" : "checkmark-circle"} size={16} color={i === 0 ? COLORS.primaryBright : COLORS.accent} />
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={cancelScan} style={styles.cancelBtn}>
            <Text style={{ color: COLORS.danger, fontWeight: "800", fontSize: 13 }}>إلغاء الفحص</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // result
  const isClean = threats.length === 0;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray50 }} edges={["top"]}>
      <View style={styles.innerHeader}>
        <View>
          <Text style={styles.innerTitle}>نتيجة الفحص</Text>
          <Text style={styles.innerSub}>تم فحص 3,247 ملف و 87 تطبيق</Text>
        </View>
        <View style={[styles.innerIcon, { backgroundColor: isClean ? COLORS.accentLight : COLORS.dangerLight }]}>
          <Ionicons name={isClean ? "checkmark" : "warning"} size={22} color={isClean ? COLORS.accent : COLORS.danger} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View
          style={[
            styles.resultCard,
            { borderColor: isClean ? COLORS.accent + "30" : COLORS.danger + "30", backgroundColor: isClean ? COLORS.white : COLORS.white },
          ]}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: isClean ? COLORS.accentLight : COLORS.dangerLight,
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
            }}
          >
            <Ionicons name={isClean ? "shield-checkmark" : "shield"} size={36} color={isClean ? COLORS.accent : COLORS.danger} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.dark, textAlign: "center", marginTop: 14 }}>
            {isClean ? "جهازك محمي بنجاح ✓" : "تم العثور على تهديد واحد!"}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.gray500, textAlign: "center", marginTop: 6, lineHeight: 18 }}>
            {isClean ? "لم يتم العثور على أي فيروسات أو برمجيات خبيثة.\nجهازك آمن تمامًا." : "ننصح بإزالة التهديد فورًا لحماية بياناتك."}
          </Text>

          {!isClean && (
            <View style={{ marginTop: 14, backgroundColor: COLORS.dangerLight, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.danger + "20", flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="warning" size={20} color={COLORS.danger} />
              </View>
              <View style={{ flex: 1, marginRight: 10, alignItems: "flex-end" }}>
                <Text style={{ fontWeight: "800", fontSize: 13, color: COLORS.danger, textAlign: "right" }}>{threats[0].name}</Text>
                <Text style={{ fontSize: 11, color: COLORS.gray700, marginTop: 2 }}>{threats[0].app}</Text>
                <View style={{ backgroundColor: COLORS.danger, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100, marginTop: 4 }}>
                  <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: "800" }}>{threats[0].level}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            {isClean ? (
              <>
                <TouchableOpacity onPress={() => setStage("idle")} style={[styles.primaryBtn, { flex: 1 }]}>
                  <Text style={styles.primaryBtnText}>تم ✓</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={startScan} style={[styles.secondaryBtn, { flex: 1 }]}>
                  <Text style={styles.secondaryBtnText}>فحص مرة أخرى</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("تمت الإزالة", "تم حذف التهديد بنجاح وحماية جهازك ✓");
                    setThreats([]);
                  }}
                  style={[styles.dangerBtn, { flex: 1 }]}
                >
                  <Ionicons name="trash" size={16} color={COLORS.white} style={{ marginLeft: 6 }} />
                  <Text style={styles.primaryBtnText}>إزالة التهديد</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStage("idle")} style={[styles.secondaryBtn, { flex: 1 }]}>
                  <Text style={styles.secondaryBtnText}>تجاهل</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.resultStats}>
          <View style={styles.resultStat}>
            <Text style={styles.resultStatNum}>3,247</Text>
            <Text style={styles.resultStatLabel}>ملف مفحوص</Text>
          </View>
          <View style={styles.resultStat}>
            <Text style={[styles.resultStatNum, { color: isClean ? COLORS.accent : COLORS.danger }]}>{threats.length}</Text>
            <Text style={styles.resultStatLabel}>تهديدات</Text>
          </View>
          <View style={styles.resultStat}>
            <Text style={styles.resultStatNum}>28s</Text>
            <Text style={styles.resultStatLabel}>مدة الفحص</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CleanerScreen() {
  const [cleaning, setCleaning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<number[]>([0, 1, 2, 3]);

  const categories = [
    { title: "ملفات الكاش", size: "642 MB", count: 1240, icon: "layers-outline", color: COLORS.primaryBright },
    { title: "ملفات مؤقتة", size: "318 MB", count: 892, icon: "time-outline", color: "#7C3AED" },
    { title: "صور مصغرة", size: "201 MB", count: 540, icon: "image-outline", color: COLORS.warning },
    { title: "ملفات فارغة", size: "89 MB", count: 67, icon: "folder-open-outline", color: COLORS.accent },
    { title: "سجل التطبيقات", size: "45 MB", count: 123, icon: "receipt-outline", color: "#EF4444" },
  ];

  const totalSize = categories.filter((_, i) => selected.includes(i)).reduce((a, c) => a + parseFloat(c.size), 0);

  const toggle = (i: number) => {
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  };

  const startClean = () => {
    if (selected.length === 0) {
      Alert.alert("تنبيه", "اختر فئة واحدة على الأقل للتنظيف");
      return;
    }
    setCleaning(true);
    setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setProgress(100);
        setTimeout(() => {
          setCleaning(false);
          setDone(true);
        }, 500);
      } else setProgress(Math.round(p));
    }, 180);
  };

  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray50 }} edges={["top"]}>
        <View style={styles.innerHeader}>
          <View>
            <Text style={styles.innerTitle}>اكتمل التنظيف ✓</Text>
            <Text style={styles.innerSub}>تم تحسين أداء جهازك</Text>
          </View>
          <View style={[styles.innerIcon, { backgroundColor: COLORS.accentLight }]}>
            <Ionicons name="checkmark" size={22} color={COLORS.accent} />
          </View>
        </View>
        <View style={{ flex: 1, padding: 16, alignItems: "center", justifyContent: "center" }}>
          <View style={styles.doneCard}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accentLight, alignItems: "center", justifyContent: "center", alignSelf: "center" }}>
              <Ionicons name="sparkles" size={36} color={COLORS.accent} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: "900", color: COLORS.dark, textAlign: "center", marginTop: 14 }}>تم توفير {totalSize.toFixed(0)} MB</Text>
            <Text style={{ fontSize: 12, color: COLORS.gray500, textAlign: "center", marginTop: 6 }}>تم حذف {selected.length} فئات من الملفات المؤقتة {"\n"}أصبح جهازك أسرع بنسبة 43%</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 16, justifyContent: "center" }}>
              <View style={styles.doneBadge}><Text style={styles.doneBadgeText}>✓ أسرع</Text></View>
              <View style={styles.doneBadge}><Text style={styles.doneBadgeText}>✓ مساحة أكبر</Text></View>
              <View style={styles.doneBadge}><Text style={styles.doneBadgeText}>✓ بطارية أفضل</Text></View>
            </View>
            <TouchableOpacity onPress={() => { setDone(false); setSelected([0,1,2,3]); }} style={[styles.primaryBtn, { marginTop: 18 }]}>
              <Text style={styles.primaryBtnText}>تم ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (cleaning) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }} edges={["top"]}>
        <View style={styles.innerHeader}>
          <View>
            <Text style={styles.innerTitle}>جاري التنظيف...</Text>
            <Text style={styles.innerSub}>يرجى الانتظار</Text>
          </View>
          <View style={[styles.innerIcon, { backgroundColor: COLORS.primarySoft }]}>
            <Ionicons name="brush" size={20} color={COLORS.primary} />
          </View>
        </View>
        <View style={{ flex: 1, padding: 24, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.primarySoft, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="trash" size={48} color={COLORS.primaryBright} />
          </View>
          <Text style={{ marginTop: 18, fontSize: 16, fontWeight: "800", color: COLORS.dark }}>{progress}%</Text>
          <View style={[styles.progressTrack, { width: "100%", marginTop: 12 }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: COLORS.accent }]} />
          </View>
          <Text style={{ marginTop: 10, fontSize: 12, color: COLORS.gray500 }}>حذف الملفات المؤقتة...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray50 }} edges={["top"]}>
      <View style={styles.innerHeader}>
        <View>
          <Text style={styles.innerTitle}>تنظيف المهملات</Text>
          <Text style={styles.innerSub}>تسريع الجهاز وتوفير المساحة</Text>
        </View>
        <View style={[styles.innerIcon, { backgroundColor: "#EDE9FE" }]}>
          <Ionicons name="brush" size={22} color="#7C3AED" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.cleanHero}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#7C3AED" }}>المساحة القابلة للتنظيف</Text>
            <Text style={{ fontSize: 28, fontWeight: "900", color: COLORS.dark, marginTop: 4 }}>{totalSize.toFixed(0)} MB</Text>
            <Text style={{ fontSize: 11, color: COLORS.gray500, marginTop: 2 }}>{selected.length} فئات محددة • {categories.filter((_,i)=>selected.includes(i)).reduce((a,c)=>a+c.count,0)} ملف</Text>
          </View>
          <View style={{ width: 86, height: 86, borderRadius: 24, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="trash-bin" size={38} color="#7C3AED" />
          </View>
        </View>

        {categories.map((c, i) => {
          const isSel = selected.includes(i);
          return (
            <TouchableOpacity key={i} onPress={() => toggle(i)} activeOpacity={0.8} style={[styles.cleanRow, isSel && { borderColor: "#7C3AED", backgroundColor: "#F5F3FF" }]}>
              <View style={[styles.cleanIcon, { backgroundColor: c.color + "18" }]}>
                <Ionicons name={c.icon as any} size={18} color={c.color} />
              </View>
              <View style={{ flex: 1, marginRight: 10, alignItems: "flex-end" }}>
                <Text style={{ fontWeight: "800", fontSize: 13, color: COLORS.dark }}>{c.title}</Text>
                <Text style={{ fontSize: 11, color: COLORS.gray500, marginTop: 2 }}>{c.count} ملف • {c.size}</Text>
              </View>
              <View style={[styles.checkBox, isSel && { backgroundColor: "#7C3AED", borderColor: "#7C3AED" }]}>
                {isSel && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity onPress={startClean} style={[styles.scanBtn, { backgroundColor: "#7C3AED", marginTop: 16 }]}>
          <Ionicons name="sparkles" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
          <Text style={styles.scanBtnText}>تنظيف الآن • توفير {totalSize.toFixed(0)} MB</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: "center", fontSize: 11, color: COLORS.gray500, marginTop: 8 }}>آمن 100% • لا يتم حذف ملفاتك الشخصية</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProtectionScreen({ route }: any) {
  const initialTab = route?.params?.tab === "lock" ? "lock" : "browse";
  const [tab, setTab] = useState(initialTab);
  const [browseEnabled, setBrowseEnabled] = useState(true);
  const [vpnEnabled, setVpnEnabled] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(true);
  const [pinModal, setPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [lockedApps, setLockedApps] = useState<number[]>([0, 1, 3, 5]);

  useEffect(() => {
    if (route?.params?.tab) setTab(route.params.tab);
  }, [route?.params]);

  const apps = [
    { name: "واتساب", pkg: "com.whatsapp", icon: "logo-whatsapp", color: "#25D366" },
    { name: "المعرض", pkg: "com.gallery", icon: "images", color: "#E91E63" },
    { name: "الرسائل", pkg: "com.messages", icon: "chatbubbles", color: "#2196F3" },
    { name: "البنك الأهلي", pkg: "com.bank", icon: "card", color: "#0A3D62" },
    { name: "الإعدادات", pkg: "com.settings", icon: "settings", color: "#607D8B" },
    { name: "فيسبوك", pkg: "com.facebook", icon: "logo-facebook", color: "#1877F2" },
    { name: "تيليجرام", pkg: "org.telegram", icon: "paper-plane", color: "#26A5E4" },
    { name: "الملفات", pkg: "com.files", icon: "folder", color: "#FF9800" },
  ];

  const blockedSites = [
    { url: "phish-banka.net", time: "منذ ساعتين", type: "تصيد" },
    { url: "free-gift-xyz.com", time: "أمس", type: "احتيال" },
    { url: "update-flash.ru", time: "منذ 3 أيام", type: "برمجية خبيثة" },
  ];

  const toggleLock = (idx: number) => {
    setLockedApps((prev) => (prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray50 }} edges={["top"]}>
      <View style={styles.innerHeader}>
        <View>
          <Text style={styles.innerTitle}>مركز الحماية</Text>
          <Text style={styles.innerSub}>حماية التصفح وقفل التطبيقات</Text>
        </View>
        <View style={[styles.innerIcon, { backgroundColor: COLORS.accentLight }]}>
          <Ionicons name="shield-checkmark" size={22} color={COLORS.accent} />
        </View>
      </View>

      <View style={styles.tabSwitch}>
        <TouchableOpacity onPress={() => setTab("browse")} style={[styles.tabBtn, tab === "browse" && styles.tabBtnActive]}>
          <Ionicons name="globe-outline" size={16} color={tab === "browse" ? COLORS.white : COLORS.gray500} style={{ marginLeft: 6 }} />
          <Text style={[styles.tabText, tab === "browse" && styles.tabTextActive]}>حماية التصفح</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("lock")} style={[styles.tabBtn, tab === "lock" && styles.tabBtnActive]}>
          <Ionicons name="lock-closed-outline" size={16} color={tab === "lock" ? COLORS.white : COLORS.gray500} style={{ marginLeft: 6 }} />
          <Text style={[styles.tabText, tab === "lock" && styles.tabTextActive]}>قفل التطبيقات</Text>
        </TouchableOpacity>
      </View>

      {tab === "browse" ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          <View style={styles.protectCard}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Switch value={browseEnabled} onValueChange={setBrowseEnabled} trackColor={{ true: COLORS.accent }} thumbColor={COLORS.white} />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ alignItems: "flex-end", marginLeft: 10 }}>
                  <Text style={{ fontWeight: "800", fontSize: 13, color: COLORS.dark }}>حماية التصفح</Text>
                  <Text style={{ fontSize: 11, color: COLORS.gray500 }}>{browseEnabled ? "نشط • يحظر المواقع الخطرة" : "متوقف"}</Text>
                </View>
                <View style={[styles.protectIcon, { backgroundColor: browseEnabled ? COLORS.accentLight : COLORS.gray100 }]}>
                  <Ionicons name="globe" size={20} color={browseEnabled ? COLORS.accent : COLORS.gray500} />
                </View>
              </View>
            </View>
            {browseEnabled && (
              <View style={{ marginTop: 12, backgroundColor: COLORS.accentLight, borderRadius: 10, padding: 10, flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
                <Text style={{ fontSize: 11, color: COLORS.dark, marginRight: 6, fontWeight: "600", flex: 1, textAlign: "right" }}>تم حظر 3 مواقع مشبوهة هذا الأسبوع</Text>
              </View>
            )}
          </View>

          <View style={styles.protectCard}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Switch value={vpnEnabled} onValueChange={setVpnEnabled} trackColor={{ true: COLORS.primaryBright }} thumbColor={COLORS.white} />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ alignItems: "flex-end", marginLeft: 10 }}>
                  <Text style={{ fontWeight: "800", fontSize: 13, color: COLORS.dark }}>شبكة آمنة VPN</Text>
                  <Text style={{ fontSize: 11, color: COLORS.gray500 }}>{vpnEnabled ? "متصل • مشفر" : "غير متصل"}</Text>
                </View>
                <View style={[styles.protectIcon, { backgroundColor: vpnEnabled ? COLORS.primarySoft : COLORS.gray100 }]}>
                  <Ionicons name="shield" size={20} color={vpnEnabled ? COLORS.primaryBright : COLORS.gray500} />
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 11, color: COLORS.gray500, marginTop: 8, textAlign: "right" }}>تشفير الاتصال على شبكات الواي فاي العامة (ميزة PRO)</Text>
          </View>

          <Text style={styles.sectionTitle}>المواقع المحظورة مؤخراً</Text>
          <View style={styles.timelineCard}>
            {blockedSites.map((s, i) => (
              <View key={i} style={[styles.timelineRow, i !== blockedSites.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 }]}>
                <View style={[styles.timelineIcon, { backgroundColor: COLORS.dangerLight }]}>
                  <Ionicons name="ban" size={14} color={COLORS.danger} />
                </View>
                <View style={{ flex: 1, marginRight: 10, alignItems: "flex-end" }}>
                  <Text style={{ fontWeight: "800", fontSize: 12, color: COLORS.dark, textAlign: "right" }}>{s.url}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.gray500 }}>{s.time} • {s.type}</Text>
                </View>
                <View style={{ backgroundColor: COLORS.dangerLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 }}>
                  <Text style={{ fontSize: 10, fontWeight: "800", color: COLORS.danger }}>محظور</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={18} color="#FF8F00" />
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontWeight: "800", fontSize: 12, color: COLORS.dark, textAlign: "right" }}>نصيحة أمان</Text>
              <Text style={{ fontSize: 11, color: COLORS.gray700, marginTop: 2, textAlign: "right", lineHeight: 16 }}>لا تدخل بياناتك البنكية إلا بعد التأكد من القفل الأخضر في المتصفح والرابط يبدأ بـ https</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          <View style={styles.protectCard}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Switch value={lockEnabled} onValueChange={setLockEnabled} trackColor={{ true: COLORS.primaryBright }} thumbColor={COLORS.white} />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ alignItems: "flex-end", marginLeft: 10 }}>
                  <Text style={{ fontWeight: "800", fontSize: 13, color: COLORS.dark }}>قفل التطبيقات</Text>
                  <Text style={{ fontSize: 11, color: COLORS.gray500 }}>{lockedApps.length} تطبيقات محمية • {lockEnabled ? "نشط" : "متوقف"}</Text>
                </View>
                <View style={[styles.protectIcon, { backgroundColor: lockEnabled ? COLORS.primarySoft : COLORS.gray100 }]}>
                  <Ionicons name="lock-closed" size={20} color={lockEnabled ? COLORS.primary : COLORS.gray500} />
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setPinModal(true)} style={styles.smallBtn}>
                <Ionicons name="keypad-outline" size={14} color={COLORS.primary} style={{ marginLeft: 5 }} />
                <Text style={{ fontSize: 11, fontWeight: "800", color: COLORS.primary }}>تغيير الرمز</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: COLORS.gray100, borderColor: COLORS.gray100 }]}>
                <Ionicons name="finger-print-outline" size={14} color={COLORS.gray700} style={{ marginLeft: 5 }} />
                <Text style={{ fontSize: 11, fontWeight: "800", color: COLORS.gray700 }}>تفعيل البصمة</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>اختر التطبيقات المراد قفلها</Text>
          {apps.map((app, idx) => {
            const locked = lockedApps.includes(idx);
            return (
              <View key={idx} style={[styles.appRow, locked && { borderColor: COLORS.primary + "30", backgroundColor: COLORS.white }]}>
                <Switch value={locked && lockEnabled} onValueChange={() => toggleLock(idx)} trackColor={{ true: COLORS.primary }} thumbColor={COLORS.white} disabled={!lockEnabled} />
                <View style={{ flex: 1, marginHorizontal: 10, alignItems: "flex-end" }}>
                  <Text style={{ fontWeight: "800", fontSize: 13, color: COLORS.dark }}>{app.name}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.gray500, marginTop: 1 }}>{app.pkg}</Text>
                </View>
                <View style={[styles.appIcon, { backgroundColor: app.color + "18" }]}>
                  <Ionicons name={app.icon as any} size={20} color={app.color} />
                </View>
                {locked && <View style={{ position: "absolute", top: 8, left: 8, backgroundColor: COLORS.primarySoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 100 }}><Text style={{ fontSize: 9, fontWeight: "800", color: COLORS.primary }}>مقفل</Text></View>}
              </View>
            );
          })}

          <View style={styles.tipCard}>
            <Ionicons name="information-circle" size={18} color={COLORS.primaryBright} />
            <Text style={{ flex: 1, marginRight: 8, fontSize: 11, color: COLORS.gray700, textAlign: "right", lineHeight: 16 }}>سيطلب منك إدخال الرمز أو البصمة عند فتح التطبيقات المقفلة. يعمل حتى بعد إعادة التشغيل.</Text>
          </View>
        </ScrollView>
      )}

      <Modal visible={pinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primarySoft, alignItems: "center", justifyContent: "center", alignSelf: "center" }}>
              <Ionicons name="lock-closed" size={26} color={COLORS.primary} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "900", color: COLORS.dark, textAlign: "center", marginTop: 12 }}>تعيين رمز القفل</Text>
            <Text style={{ fontSize: 11, color: COLORS.gray500, textAlign: "center", marginTop: 4 }}>أدخل رمز مكون من 4 أرقام</Text>
            <TextInput
              value={pin}
              onChangeText={setPin}
              placeholder="••••"
              placeholderTextColor={COLORS.gray300}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              style={styles.pinInput}
              textAlign="center"
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <TouchableOpacity onPress={() => setPinModal(false)} style={[styles.secondaryBtn, { flex: 1 }]}>
                <Text style={styles.secondaryBtnText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (pin.length < 4) Alert.alert("تنبيه", "الرمز يجب أن يكون 4 أرقام");
                  else {
                    Alert.alert("تم", "تم حفظ الرمز بنجاح ✓");
                    setPinModal(false);
                  }
                }}
                style={[styles.primaryBtn, { flex: 1 }]}
              >
                <Text style={styles.primaryBtnText}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsScreen() {
  const [autoScan, setAutoScan] = useState(true);
  const [notify, setNotify] = useState(true);
  const [lang] = useState("العربية");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray50 }} edges={["top"]}>
      <View style={styles.innerHeader}>
        <View>
          <Text style={styles.innerTitle}>الإعدادات والدعم</Text>
          <Text style={styles.innerSub}>تطبيق حماية ابن الهاشمي</Text>
        </View>
        <View style={[styles.innerIcon, { backgroundColor: COLORS.primarySoft }]}>
          <Ionicons name="settings" size={22} color={COLORS.primary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        {/* Profile / Brand */}
        <View style={styles.brandCard}>
          <View style={styles.brandGlow} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 }}>
              <Ionicons name="shield-checkmark" size={36} color={COLORS.primary} />
            </View>
            <View style={{ marginRight: 12, flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "900", color: COLORS.dark, textAlign: "right" }}>تطبيق حماية ابن الهاشمي</Text>
              <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 3, textAlign: "right" }}>Antivirus • Cleaner • AppLock • Safe Browse</Text>
              <View style={{ flexDirection: "row", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
                <View style={{ backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 }}>
                  <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: "800" }}>v3.2.1</Text>
                </View>
                <View style={{ backgroundColor: COLORS.white, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 }}>
                  <Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: "800" }}>✓ موثوق</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
            <View style={styles.brandStat}><Text style={styles.brandStatNum}>+50K</Text><Text style={styles.brandStatLabel}>تحميل</Text></View>
            <View style={styles.brandStat}><Text style={styles.brandStatNum}>4.8★</Text><Text style={styles.brandStatLabel}>تقييم</Text></View>
            <View style={styles.brandStat}><Text style={styles.brandStatNum}>24/7</Text><Text style={styles.brandStatLabel}>دعم</Text></View>
          </View>
        </View>

        {/* Subscription */}
        <Text style={styles.sectionTitle}>الاشتراك والدعم الفني</Text>
        <View style={styles.contactCard}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primarySoft, alignItems: "center", justifyContent: "center", marginLeft: 10 }}>
              <Ionicons name="headset" size={22} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ fontWeight: "900", fontSize: 13, color: COLORS.dark }}>تواصل مع مطور التطبيق</Text>
              <Text style={{ fontSize: 11, color: COLORS.gray500, marginTop: 2 }}>للاشتراك بنظام الحماية المتقدم PRO</Text>
            </View>
          </View>

          <View style={{ backgroundColor: COLORS.gray50, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.gray100, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${PHONE}`)}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="call" size={16} color={COLORS.white} />
            </TouchableOpacity>
            <View style={{ alignItems: "flex-end", flex: 1, marginHorizontal: 10 }}>
              <Text style={{ fontSize: 10, color: COLORS.gray500, fontWeight: "700" }}>رقم التواصل</Text>
              <Text style={{ fontSize: 15, fontWeight: "900", color: COLORS.dark, letterSpacing: 1, marginTop: 2 }}>{PHONE}</Text>
            </View>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.gray100 }}>
              <Ionicons name="call-outline" size={16} color={COLORS.primary} />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://wa.me/${PHONE.replace("+", "")}?text=السلام%20عليكم%20أريد%20الاشتراك%20في%20نظام%20حماية%20ابن%20الهاشمي%20PRO%20%F0%9F%9B%A1%EF%B8%8F`)}
              style={[styles.primaryBtn, { flex: 1, backgroundColor: "#25D366" }]}
            >
              <Ionicons name="logo-whatsapp" size={18} color={COLORS.white} style={{ marginLeft: 6 }} />
              <Text style={styles.primaryBtnText}>تواصل واتساب</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${PHONE}`)} style={[styles.primaryBtn, { flex: 1 }]}>
              <Ionicons name="call" size={18} color={COLORS.white} style={{ marginLeft: 6 }} />
              <Text style={styles.primaryBtnText}>اتصال مباشر</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 10, color: COLORS.gray500, textAlign: "center", marginTop: 8 }}>رد فوري • دعم بالعربية • تفعيل خلال دقائق</Text>
        </View>

        <View style={styles.proFeatures}>
          <Text style={{ fontWeight: "900", fontSize: 12, color: COLORS.dark, textAlign: "right" }}>مزايا نسخة PRO:</Text>
          {["حماية لحظية من الفيروسات والروابط الملغمة", "حظر إعلانات وتتبع تلقائي", "قفل تطبيقات ببصمة + تمويه", "تنظيف تلقائي يومي وتسريع الألعاب"].map((f, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", marginTop: 7, justifyContent: "flex-end" }}>
              <Text style={{ fontSize: 11, color: COLORS.gray700, marginRight: 6, textAlign: "right", flex: 1 }}>{f}</Text>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.accentLight, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="checkmark" size={12} color={COLORS.accent} />
              </View>
            </View>
          ))}
        </View>

        {/* Settings toggles */}
        <Text style={styles.sectionTitle}>الإعدادات العامة</Text>
        <View style={styles.timelineCard}>
          <View style={styles.settingRow}>
            <Switch value={autoScan} onValueChange={setAutoScan} trackColor={{ true: COLORS.primaryBright }} thumbColor={COLORS.white} />
            <View style={{ flex: 1, marginRight: 10, alignItems: "flex-end" }}>
              <Text style={styles.settingTitle}>فحص تلقائي يومي</Text>
              <Text style={styles.settingSub}>فحص كل التطبيقات الجديدة تلقائياً</Text>
            </View>
            <View style={[styles.settingIcon, { backgroundColor: COLORS.primarySoft }]}><Ionicons name="sync" size={16} color={COLORS.primary} /></View>
          </View>
          <View style={styles.settingRow}>
            <Switch value={notify} onValueChange={setNotify} trackColor={{ true: COLORS.primaryBright }} thumbColor={COLORS.white} />
            <View style={{ flex: 1, marginRight: 10, alignItems: "flex-end" }}>
              <Text style={styles.settingTitle}>تنبيهات الحماية</Text>
              <Text style={styles.settingSub}>إشعارات فورية عند اكتشاف خطر</Text>
            </View>
            <View style={[styles.settingIcon, { backgroundColor: COLORS.warningLight }]}><Ionicons name="notifications" size={16} color={COLORS.warning} /></View>
          </View>
          <View style={styles.settingRow}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.primary }}>{lang} • RTL</Text>
            <View style={{ flex: 1, marginRight: 10, alignItems: "flex-end" }}>
              <Text style={styles.settingTitle}>اللغة</Text>
              <Text style={styles.settingSub}>واجهة عربية بالكامل</Text>
            </View>
            <View style={[styles.settingIcon, { backgroundColor: COLORS.accentLight }]}><Ionicons name="language" size={16} color={COLORS.accent} /></View>
          </View>
        </View>

        <View style={styles.linksCard}>
          {[
            { icon: "shield-checkmark-outline", title: "سياسة الخصوصية", sub: "تشفير AES-256 وحماية بياناتك" },
            { icon: "document-text-outline", title: "شروط الاستخدام", sub: "اتفاقية الترخيص" },
            { icon: "star-outline", title: "قيّم التطبيق", sub: "ادعمنا بتقييم 5 نجوم ⭐" },
            { icon: "share-social-outline", title: "مشاركة التطبيق", sub: "شارك الحماية مع أصدقائك" },
          ].map((l, i) => (
            <TouchableOpacity key={i} onPress={() => Alert.alert(l.title, "سيتم فتح " + l.title + " قريباً")} style={[styles.linkRow, i !== 3 && { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 }]}>
              <Ionicons name="chevron-back" size={16} color={COLORS.gray300} />
              <View style={{ flex: 1, marginHorizontal: 10, alignItems: "flex-end" }}>
                <Text style={{ fontWeight: "700", fontSize: 13, color: COLORS.dark }}>{l.title}</Text>
                <Text style={{ fontSize: 11, color: COLORS.gray500, marginTop: 1 }}>{l.sub}</Text>
              </View>
              <View style={[styles.linkIcon, { backgroundColor: COLORS.gray50 }]}><Ionicons name={l.icon as any} size={16} color={COLORS.primary} /></View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ alignItems: "center", marginTop: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: "800", color: COLORS.primary }}>تطبيق حماية ابن الهاشمي</Text>
          <Text style={{ fontSize: 10, color: COLORS.gray500, marginTop: 3 }}>© 2024 جميع الحقوق محفوظة • صنع بعناية في اليمن 🇾🇪</Text>
          <Text style={{ fontSize: 10, color: COLORS.gray300, marginTop: 6 }}>Antivirus Toolkit • Secure • Fast • Private</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Navigation ---
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray100,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800", marginTop: 2 },
        tabBarIcon: ({ color, focused }) => {
          const icons: any = {
            الرئيسية: focused ? "home" : "home-outline",
            الفحص: focused ? "scan" : "scan-outline",
            التنظيف: focused ? "brush" : "brush-outline",
            الحماية: focused ? "shield-checkmark" : "shield-checkmark-outline",
            الإعدادات: focused ? "settings" : "settings-outline",
          };
          // special scan middle button
          if (route.name === "الفحص") {
            return (
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: focused ? COLORS.primary : COLORS.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: 6, borderWidth: focused ? 0 : 1, borderColor: COLORS.primaryMuted }}>
                <Ionicons name={icons[route.name]} size={22} color={focused ? COLORS.white : COLORS.primary} />
              </View>
            );
          }
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="الرئيسية" component={DashboardScreen} />
      <Tab.Screen name="التنظيف" component={CleanerScreen} />
      <Tab.Screen name="الفحص" component={ScanScreen} />
      <Tab.Screen name="الحماية" component={ProtectionScreen} />
      <Tab.Screen name="الإعدادات" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });
  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitle: { fontSize: 14, fontWeight: "900", color: COLORS.dark, textAlign: "right" },
  brandSub: { fontSize: 10, color: COLORS.gray500, marginTop: 1, fontWeight: "600" },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.gray50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  dot: { position: "absolute", top: 6, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger, borderWidth: 1.5, borderColor: COLORS.white },
  dashboardCard: {
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray100,
    shadowColor: COLORS.cardShadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  scanBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    width: "100%",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  scanBtnText: { color: COLORS.white, fontSize: 15, fontWeight: "900" },
  scanBtnSub: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "700", marginRight: 8, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 2 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray100,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statNum: { fontSize: 16, fontWeight: "900", color: COLORS.dark },
  statLabel: { fontSize: 10, color: COLORS.gray500, marginTop: 2, fontWeight: "600" },
  sectionTitle: { fontSize: 13, fontWeight: "900", color: COLORS.dark, textAlign: "right", paddingHorizontal: 16, marginTop: 18, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16 },
  featureCard: {
    width: (width - 42) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureTitle: { fontSize: 13, fontWeight: "900", color: COLORS.dark, marginTop: 10, textAlign: "right" },
  featureDesc: { fontSize: 11, color: COLORS.gray500, marginTop: 3, textAlign: "right", lineHeight: 14 },
  proCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  proGlow: { position: "absolute", top: -40, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.08)" },
  proBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  proBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  proIconWrap: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  proCheck: { position: "absolute", bottom: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.primary },
  timelineCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    overflow: "hidden",
  },
  timelineRow: { flexDirection: "row", alignItems: "center", padding: 12, justifyContent: "space-between" },
  timelineIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  // inner
  innerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  innerTitle: { fontSize: 15, fontWeight: "900", color: COLORS.dark, textAlign: "right" },
  innerSub: { fontSize: 11, color: COLORS.gray500, marginTop: 2, textAlign: "right" },
  innerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  scanIdleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray100,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  scanOptCard: { flex: 1, backgroundColor: COLORS.gray50, borderRadius: 12, padding: 10, alignItems: "center", borderWidth: 1, borderColor: COLORS.gray100 },
  scanOptText: { fontSize: 11, fontWeight: "800", color: COLORS.dark, marginTop: 6 },
  scanOptSub: { fontSize: 10, color: COLORS.gray500, marginTop: 2 },
  infoGrid: { flexDirection: "row", gap: 10, marginTop: 12 },
  infoCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.gray100 },
  infoNum: { fontSize: 16, fontWeight: "900", color: COLORS.primary },
  infoLabel: { fontSize: 10, color: COLORS.gray500, marginTop: 2, fontWeight: "600", textAlign: "center" },
  progressTrack: { height: 8, backgroundColor: COLORS.gray100, borderRadius: 100, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: COLORS.primaryBright, borderRadius: 100 },
  scanFileRow: { flexDirection: "row", alignItems: "center", marginTop: 10, backgroundColor: COLORS.gray50, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.gray100 },
  scanPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent, marginRight: 6 },
  cancelBtn: { marginTop: 18, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 100, backgroundColor: COLORS.dangerLight, borderWidth: 1, borderColor: COLORS.danger + "20" },
  resultCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  primaryBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  primaryBtnText: { color: COLORS.white, fontWeight: "900", fontSize: 13 },
  secondaryBtn: { backgroundColor: COLORS.gray100, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.gray100 },
  secondaryBtnText: { color: COLORS.gray700, fontWeight: "800", fontSize: 13 },
  dangerBtn: { backgroundColor: COLORS.danger, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  resultStats: { flexDirection: "row", gap: 10, marginTop: 12 },
  resultStat: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.gray100 },
  resultStatNum: { fontSize: 15, fontWeight: "900", color: COLORS.primary },
  resultStatLabel: { fontSize: 10, color: COLORS.gray500, marginTop: 2, fontWeight: "600" },
  cleanHero: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.gray100, marginBottom: 12 },
  cleanRow: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.gray100, marginBottom: 8 },
  cleanIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.gray300, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.white },
  doneCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, width: "100%", borderWidth: 1, borderColor: COLORS.gray100 },
  doneBadge: { backgroundColor: COLORS.gray50, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1, borderColor: COLORS.gray100 },
  doneBadgeText: { fontSize: 11, fontWeight: "700", color: COLORS.gray700 },
  tabSwitch: { flexDirection: "row", backgroundColor: COLORS.white, margin: 16, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: COLORS.gray100 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10 },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: "800", color: COLORS.gray500 },
  tabTextActive: { color: COLORS.white },
  protectCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.gray100, marginBottom: 10 },
  protectIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tipCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.gray100, marginTop: 12 },
  smallBtn: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primarySoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, borderWidth: 1, borderColor: COLORS.primaryMuted },
  appRow: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.gray100, marginBottom: 8, paddingTop: 16 },
  appIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, width: "100%", maxWidth: 340 },
  pinInput: { marginTop: 12, backgroundColor: COLORS.gray50, borderWidth: 1, borderColor: COLORS.gray100, borderRadius: 12, paddingVertical: 12, fontSize: 22, fontWeight: "900", letterSpacing: 8, color: COLORS.dark },
  brandCard: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 16, overflow: "hidden" },
  brandGlow: { position: "absolute", top: -30, left: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.07)" },
  brandStat: { flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 12, paddingVertical: 8, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  brandStatNum: { fontSize: 14, fontWeight: "900", color: COLORS.white },
  brandStatLabel: { fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  contactCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.gray100 },
  proFeatures: { backgroundColor: COLORS.white, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.gray100, marginTop: 10 },
  settingRow: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  settingTitle: { fontSize: 13, fontWeight: "800", color: COLORS.dark, textAlign: "right" },
  settingSub: { fontSize: 11, color: COLORS.gray500, marginTop: 2, textAlign: "right" },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  linksCard: { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray100, marginTop: 12, overflow: "hidden" },
  linkRow: { flexDirection: "row", alignItems: "center", padding: 12 },
  linkIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.gray100 },
});
