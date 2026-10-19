/**
 * Helper to compute real, upcoming dynamic consultation slots
 * based on current week to eliminate stale/past dates.
 */
export function getDynamicUpcomingSlots(lang: 'fr' | 'ar' | 'en'): string[] {
  const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const monthsAr = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  
  const daysFr = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  const monthsFr = ['Jan.', 'Fév.', 'Mar.', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
  
  const daysEn = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const slots = [
    { offsetDays: 1, time: '10:00' },
    { offsetDays: 3, time: '14:00' },
    { offsetDays: 5, time: '16:00' }
  ];

  const now = new Date();
  return slots.map(s => {
    const d = new Date(now.getTime() + s.offsetDays * 86400000);
    const dayNum = d.getDate();
    const dayOfWeek = d.getDay();
    const monthIdx = d.getMonth();

    if (lang === 'ar') {
      return `${daysAr[dayOfWeek]} ${dayNum} ${monthsAr[monthIdx]} - ${s.time}`;
    } else if (lang === 'en') {
      return `${daysEn[dayOfWeek]} ${monthsEn[monthIdx]} ${dayNum} - ${s.time}`;
    } else {
      return `${daysFr[dayOfWeek]} ${dayNum} ${monthsFr[monthIdx]} - ${s.time}`;
    }
  });
}
