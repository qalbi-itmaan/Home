import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'fr' | 'ar' | 'en';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations: Record<string, Record<Lang, string>> = {
  // Navigation
  'nav.home': { fr: 'Accueil', ar: 'الرئيسية', en: 'Home' },
  'nav.formations': { fr: 'Formations', ar: 'التكوينات', en: 'Trainings' },
  'nav.consultations': { fr: 'Consultations', ar: 'الاستشارات', en: 'Consultations' },
  'nav.about': { fr: 'À propos', ar: 'من نحن', en: 'About' },
  'nav.contact': { fr: 'Contact', ar: 'تواصل معنا', en: 'Contact' },
  'nav.reserve': { fr: 'Prendre RDV', ar: 'حجز موعد', en: 'Book Appointment' },

  // Hero
  'hero.tagline': { fr: '♡ Bienvenue chez Qalbi Itmaan', ar: '♡ مرحباً بكم في مركز قلبي اطمأن', en: '♡ Welcome to Qalbi Itmaan' },
  'hero.title1': { fr: 'Qalbi Itmaan', ar: 'قلبي اطمأن', en: 'Qalbi Itmaan' },
  'hero.title2': { fr: 'pour des foyers apaisés.', ar: 'لأجل بيوت مطمئنة.', en: 'for peaceful homes.' },
  'hero.subtitle': { fr: 'Conseil familial, éducatif, **formations** et ressources pour vous aider à construire **une vie sereine** et épanouissante.', ar: 'إرشاد أسري وتربوي، تكوينات وموارد لمساعدتكم على بناء حياة هادئة ومزدهرة.', en: 'Family and educational counseling, trainings and resources to help you build a serene and fulfilling life.' },
  'hero.cta.formations': { fr: 'Découvrir nos formations', ar: 'اكتشف تكويناتنا', en: 'Explore our trainings' },
  'hero.cta.consultation': { fr: 'Réserver une consultation', ar: 'حجز استشارة', en: 'Book a consultation' },
  'hero.social_proof': { fr: '+1200 familles nous font déjà confiance', ar: '+1200 عائلة تثق بنا بالفعل', en: '+1200 families already trust us' },
  'hero.social_proof_rating': { fr: '4.9/5 (Basé sur 568 avis)', ar: '4.9/5 (بناءً على 568 تقييمًا)', en: '4.9/5 (Based on 568 reviews)' },
  'hero.widget.next_appointment': { fr: 'Prochain rendez-vous', ar: 'الموعد القادم', en: 'Next appointment' },
  'hero.widget.see_details': { fr: 'Voir le détail →', ar: 'عرض التفاصيل ←', en: 'See details →' },
  'hero.widget.recommended_course': { fr: 'Formation recommandée', ar: 'الدورة الموصى بها', en: 'Recommended training' },
  'hero.widget.online_available': { fr: 'Consultation en ligne', ar: 'استشارة عبر الإنترنت', en: 'Online consultation' },
  'hero.widget.available': { fr: 'Disponible', ar: 'متاحة', en: 'Available' },
  'hero.widget.resources': { fr: 'Ressources & articles', ar: 'موارد ومقالات', en: 'Resources & articles' },
  'hero.widget.new_articles': { fr: 'Nouveaux articles', ar: 'مقالات جديدة', en: 'New articles' },

  // Stats
  'stats.formations': { fr: 'Formations', ar: 'تكوين', en: 'Trainings' },
  'stats.students': { fr: 'Apprenants', ar: 'متعلم', en: 'Learners' },
  'stats.satisfaction': { fr: 'Satisfaction', ar: 'رضا', en: 'Satisfaction' },
  'stats.experts': { fr: 'Experts', ar: 'خبير', en: 'Experts' },
  'stats.families': { fr: 'Familles accompagnées', ar: 'أسرة مرافقة', en: 'Families supported' },
  'stats.experts_qual': { fr: 'Experts qualifiés', ar: 'خبير مؤهل', en: 'Qualified experts' },
  'stats.satisfaction_rate': { fr: 'Taux de satisfaction', ar: 'نسبة الرضا', en: 'Satisfaction rate' },
  'stats.available_courses': { fr: 'Formations disponibles', ar: 'دورة متاحة', en: 'Available trainings' },

  // Services
  'services.title': { fr: 'Nos Services', ar: 'خدماتنا', en: 'Our Services' },
  'services.subtitle': { fr: 'Un accompagnement complet et personnalisé pour chaque étape de votre vie de famille', ar: 'مرافقة شاملة ومخصصة لكل مرحلة في حياتكم الأسرية', en: 'Comprehensive and personalized support for every stage of your family life' },
  'services.learn_more': { fr: 'En savoir plus', ar: 'اقرأ المزيد', en: 'Learn more' },
  
  'service.consultation.name': { fr: 'Conseil familial', ar: 'الإرشاد الأسري', en: 'Family Counseling' },
  'service.consultation.desc': { fr: 'Accompagnement pour renforcer les liens et résoudre les conflits familiaux.', ar: 'مرافقة لتعزيز الروابط وحل النزاعات الأسرية.', en: 'Support to strengthen bonds and resolve family conflicts.' },
  'service.psycho.name': { fr: 'Accompagnement parental', ar: 'مرافقة الوالدين', en: 'Parental Coaching' },
  'service.psycho.desc': { fr: 'Soutien individuel et parental pour surmonter les défis éducatifs au quotidien.', ar: 'دعم فردي ووالدي لتجاوز التحديات التربوية اليومية.', en: 'Individual and parental support to overcome daily educational challenges.' },
  'service.couple.name': { fr: 'Consultations de couple', ar: 'استشارات زوجية', en: 'Couple Consultations' },
  'service.couple.desc': { fr: 'Améliorez la communication et reconstruisez une relation saine et épanouie.', ar: 'حسّن التواصل وأعد بناء علاقة صحية ومزدهرة.', en: 'Improve communication and rebuild a healthy, fulfilling relationship.' },
  'service.education.name': { fr: 'Accompagnement des enfants', ar: 'مرافقة الأطفال', en: 'Child Support' },
  'service.education.desc': { fr: 'Aide spécialisée pour les enfants et adolescents face à leurs défis.', ar: 'مساعدة متخصصة للأطفال والمراهقين لمواجهة تحدياتهم.', en: 'Specialized assistance for children and adolescents facing challenges.' },
  'service.formation.name': { fr: 'Formations en ligne', ar: 'دورات عبر الإنترنت', en: 'Online Trainings' },
  'service.formation.desc': { fr: 'Développez vos compétences avec nos formations certifiées par des experts.', ar: 'طوّر مهاراتك مع دوراتنا المعتمدة من قبل خبراء.', en: 'Develop your skills with our expert-certified training programs.' },
  'service.workshop.name': { fr: 'Ressources & Ateliers', ar: 'موارد وورشات', en: 'Resources & Workshops' },
  'service.workshop.desc': { fr: 'Articles, podcasts et ateliers pratiques pour votre bien-être au quotidien.', ar: 'مقالات، بودكاست وورشات عمل عملية لرفاهيتكم اليومية.', en: 'Articles, podcasts, and practical workshops for your daily well-being.' },
  'service.coaching.name': { fr: 'Coaching & Accompagnement', ar: 'التدريب والمرافقة الشخصية', en: 'Coaching & Personal Growth' },

  // Pourquoi Choisir
  'why.title': { fr: 'Pourquoi choisir Qalbi Itmaan ?', ar: 'لماذا تختار قلبي اطمأن؟', en: 'Why choose Qalbi Itmaan?' },
  'why.subtitle': { fr: 'Notre engagement pour votre apaisement intérieur et la réussite de votre famille', ar: 'التزامنا نحو طمأنينتكم الداخلية ونجاح أسرتكم', en: 'Our commitment to your inner peace and family success' },
  'why.confidentiality.title': { fr: 'Confidentialité', ar: 'السرية التامة', en: 'Confidentiality' },
  'why.confidentiality.desc': { fr: 'Toutes vos données et échanges restent strictement confidentiels.', ar: 'جميع بياناتك ومحادثاتك تظل سرية تماماً.', en: 'All your data and exchanges remain strictly confidential.' },
  'why.kindness.title': { fr: 'Écoute bienveillante', ar: 'إصغاء برحمة', en: 'Kind Listening' },
  'why.kindness.desc': { fr: 'Une écoute sans jugement guidée par l\'empathie et la sérénité.', ar: 'إصغاء بدون أحكام مسبقة يسترشد بالتعاطف والطمأنينة.', en: 'Non-judgmental listening guided by empathy and serenity.' },
  'why.experts.title': { fr: 'Experts qualifiés', ar: 'خبراء مؤهلون', en: 'Qualified Experts' },
  'why.experts.desc': { fr: 'Une équipe de thérapeutes et formateurs certifiés.', ar: 'فريق من المعالجين والمدربين المعتمدين.', en: 'A team of certified therapists and trainers.' },
  'why.integrated.title': { fr: 'Approche intégrée', ar: 'نهج متكامل', en: 'Integrated Approach' },
  'why.integrated.desc': { fr: 'Alliance harmonieuse entre science éducative et valeurs spirituelles.', ar: 'تناغم بين العلوم التربوية والقيم الروحية.', en: 'Harmonious alliance between educational science and spiritual values.' },
  'why.accessibility.title': { fr: 'Accessibilité', ar: 'سهولة الوصول', en: 'Accessibility' },
  'why.accessibility.desc': { fr: 'Consultations en ligne ou en présentiel selon vos préférences.', ar: 'استشارات عبر الإنترنت أو حضورية حسب تفضيلك.', en: 'Online or in-person consultations according to your preference.' },
  'why.results.title': { fr: 'Résultats concrets', ar: 'نتائج ملموسة', en: 'Concrete Results' },
  'why.results.desc': { fr: 'Un accompagnement orienté solutions pour un changement durable.', ar: 'مرافقة موجهة نحو الحلول لتغيير إيجابي مستدام.', en: 'Solution-oriented support for lasting positive change.' },

  // Experts section
  'experts.title': { fr: 'Nos Experts & Thérapeutes', ar: 'خبراؤنا والمعالجون', en: 'Our Experts & Therapists' },
  'experts.subtitle': { fr: 'Des professionnels passionnés, diplômés et à votre écoute', ar: 'مهنيون شغوفون، مؤهلون وفي خدمتكم', en: 'Passionate, qualified professionals at your service' },
  'experts.view_all': { fr: 'Voir tous nos experts', ar: 'عرض جميع الخبراء', en: 'View all experts' },
  'experts.book_btn': { fr: 'Prendre rdv', ar: 'حجز موعد', en: 'Book now' },
  'expert.see_profile': { fr: 'Voir profil & RDV', ar: 'عرض الملف والحجز', en: 'View profile & book' },

  // Expert Modal
  'expert_modal.bio_title': { fr: 'Biographie & Parcours', ar: 'السيرة الذاتية والخبرة', en: 'Biography & Background' },
  'expert_modal.default_bio': { fr: 'Spécialiste diplômé avec une grande expérience dans l\'accompagnement familial, éducatif et le développement personnel.', ar: 'أخصائي معتمد ومؤهل ذو خبرة واسعة في المرافقة الأسرية والتربوية وتطوير الذات.', en: 'Certified specialist with extensive experience in family guidance, education, and personal growth.' },
  'expert_modal.slots_title': { fr: 'Prochains créneaux disponibles', ar: 'المواعيد المتاحة القادمة', en: 'Next Available Slots' },
  'expert_modal.close': { fr: 'Fermer', ar: 'إغلاق', en: 'Close' },
  'expert_modal.book_with': { fr: 'Réserver avec', ar: 'احجز مع', en: 'Book with' },

  // FAQ
  'faq.title': { fr: 'Foire aux questions', ar: 'الأسئلة الشائعة', en: 'Frequently Asked Questions' },
  'faq.subtitle': { fr: 'Des réponses claires à vos questions les plus fréquentes', ar: 'إجابات واضحة على أسئلتك الأكثر تكراراً', en: 'Clear answers to your most frequent questions' },
  'faq.q1': { fr: 'Comment se déroule une consultation en ligne ?', ar: 'كيف تتم الاستشارة عبر الإنترنت؟', en: 'How does an online consultation work?' },
  'faq.a1': { fr: 'Les séances en ligne s\'effectuent via visioconférence sécurisée (Zoom ou Google Meet). Après votre réservation, vous recevrez un lien d\'accès confidentiel par email et SMS.', ar: 'تتم الجلسات عبر مكالمة فيديو آمنة (Zoom أو Google Meet). بعد الحجز، ستتلقى رابط دائم وسري عبر البريد والرسائل النصية.', en: 'Online sessions take place via secure videoconferencing (Zoom or Google Meet). After booking, you will receive a confidential link by email and SMS.' },
  'faq.q2': { fr: 'Les échanges sont-ils strictement confidentiels ?', ar: 'هل المحادثات سرية تماماً؟', en: 'Are discussions strictly confidential?' },
  'faq.a2': { fr: 'Absolument. La confidentialité et le respect du secret professionnel sont au cœur de nos engagements d\'éthique et de déontologie.', ar: 'بالتأكيد. السرية التامة واحترام السر المهني في صميم التزاماتنا الأخلاقية والمهنية.', en: 'Absolutely. Confidentiality and respect for professional secrecy are at the core of our ethical commitments.' },
  'faq.q3': { fr: 'Puis-je annuler ou reporter mon rendez-vous ?', ar: 'هل يمكنني إلغاء أو تغيير موعدي؟', en: 'Can I cancel or reschedule my appointment?' },
  'faq.a3': { fr: 'Oui, vous pouvez modifier ou annuler votre réservation sans frais jusqu\'à 24 heures avant l\'heure du rendez-vous.', ar: 'نعم، يمكنك تعديل أو إلغاء حجزك مجاناً حتى 24 ساعة قبل الموعد المحدد.', en: 'Yes, you can modify or cancel your booking for free up to 24 hours before the appointment time.' },
  'faq.q4': { fr: 'Comment obtenir l\'attestation de fin de formation ?', ar: 'كيف أحصل على شهادة إتمام التكوين؟', en: 'How do I get my course completion certificate?' },
  'faq.a4': { fr: 'Dès que vous avez complété 100% des modules d\'une formation, votre certificat nominatif est généré automatiquement et téléchargeable au format PDF.', ar: 'بمجرد إكمال 100٪ من محاور التكوين، يتم إصدار شهادتك الاسمية تلقائياً وتحميلها بصيغة PDF.', en: 'As soon as you complete 100% of the training modules, your personalized certificate is automatically generated and downloadable in PDF format.' },

  // Formations page & Catalogue
  'formations.title': { fr: 'Nos Formations', ar: 'تكويناتنا', en: 'Our Trainings' },
  'formations.subtitle': { fr: 'Nos formations pour vous accompagner', ar: 'تكويناتنا لمرافقتكم ودعمكم', en: 'Our trainings to support you' },
  'formations.all': { fr: 'Toutes', ar: 'الكل', en: 'All' },
  'formations.langues': { fr: 'Langues', ar: 'لغات', en: 'Languages' },
  'formations.religieux': { fr: 'Sciences Religieuses', ar: 'علوم شرعية', en: 'Islamic Sciences' },
  'formations.soutien': { fr: 'Soutien Scolaire', ar: 'دروس دعم', en: 'Academic Support' },
  'formations.softskills': { fr: 'Soft Skills', ar: 'مهارات ناعمة', en: 'Soft Skills' },
  'formations.featured_title': { fr: 'Formations mises en avant', ar: 'دورات مميزة', en: 'Featured Trainings' },
  'formations.featured_subtitle': { fr: 'Développez vos connaissances et acquérez de nouvelles compétences', ar: 'طوّر معرفتك واكتسب مهارات جديدة', en: 'Expand your knowledge and acquire new skills' },
  'formations.view_all': { fr: 'Voir toutes les formations', ar: 'عرض جميع التكوينات', en: 'View all trainings' },
  'formations.search_placeholder': { fr: 'Rechercher une formation, un thème...', ar: 'ابحث عن دورة، موضوع...', en: 'Search for a course, topic...' },
  'formations.found_count': { fr: 'formations trouvées', ar: 'دورة تدريبية موجودة', en: 'trainings found' },
  'formations.newsletter_title': { fr: 'Restez inspiré, progressez chaque semaine', ar: 'ابقَ ملهمًا، وطوّر مهاراتك كل أسبوع', en: 'Stay inspired, make progress every week' },
  'formations.newsletter_desc': { fr: 'Recevez nos nouveaux programmes, conseils et offres exclusives.', ar: 'احصل على برامجنا الجديدة، النصائح والعروض الحصرية.', en: 'Receive our new programs, tips, and exclusive offers.' },
  'formations.subscribe': { fr: 'S\'inscrire', ar: 'اشتراك', en: 'Subscribe' },
  'formations.subscribed': { fr: 'Inscrit ✓', ar: 'تم الاشتراك ✓', en: 'Subscribed ✓' },
  'formations.register': { fr: "S'inscrire", ar: 'سجّل الآن', en: 'Register Now' },
  'formations.details': { fr: 'Voir les détails', ar: 'عرض التفاصيل', en: 'View Details' },
  'formations.duration': { fr: 'heures', ar: 'ساعات', en: 'hours' },
  'formations.level.beginner': { fr: 'Débutant', ar: 'مبتدئ', en: 'Beginner' },
  'formations.level.intermediate': { fr: 'Intermédiaire', ar: 'متوسط', en: 'Intermediate' },
  'formations.level.advanced': { fr: 'Avancé', ar: 'متقدم', en: 'Advanced' },
  'formations.type.presentiel': { fr: 'Présentiel', ar: 'حضوري', en: 'In-person' },
  'formations.type.online': { fr: 'En ligne', ar: 'عن بعد', en: 'Online' },
  'formations.type.hybrid': { fr: 'Hybride', ar: 'هجين', en: 'Hybrid' },
  'formations.noResults': { fr: 'Aucune formation disponible pour le moment.', ar: 'لا توجد تكوينات متاحة حاليا.', en: 'No training programs available at the moment.' },
  'formations.loading': { fr: 'Chargement des formations...', ar: 'جاري تحميل التكوينات...', en: 'Loading trainings...' },

  // Testimonials
  'testimonials.title': { fr: 'Ils témoignent', ar: 'آراء زبائننا', en: 'Testimonials' },
  'testimonials.subtitle': { fr: 'Découvrez ce que les familles et apprenants disent de notre accompagnement', ar: 'اكتشف ما تقوله الأسر والمتعلمون عن مرافقتنا', en: 'Discover what families and learners say about our guidance' },

  // Bottom CTA Banner
  'cta.banner_title': { fr: 'Prêt à commencer votre parcours vers plus de sérénité ?', ar: 'هل أنت مستعد للبدء في رحلتك نحو المزيد من الطمأنينة؟', en: 'Ready to start your journey towards more serenity?' },
  'cta.banner_subtitle': { fr: 'Prenez rendez-vous dès maintenant avec l\'un de nos experts qualifiés.', ar: 'احجز موعداً الآن مع أحد خبرائنا المؤهلين.', en: 'Book an appointment now with one of our qualified experts.' },

  // Formation detail
  'detail.objectives': { fr: 'Objectifs', ar: 'الأهداف', en: 'Objectives' },
  'detail.curriculum': { fr: 'Programme', ar: 'البرنامج', en: 'Curriculum' },
  'detail.prerequisites': { fr: 'Prérequis', ar: 'المتطلبات', en: 'Prerequisites' },
  'detail.targetAudience': { fr: 'Public cible', ar: 'الفئة المستهدفة', en: 'Target Audience' },
  'detail.inscription': { fr: 'Inscription', ar: 'التسجيل', en: 'Registration' },
  'detail.price': { fr: 'Prix', ar: 'السعر', en: 'Price' },
  'detail.badge_popular': { fr: 'Populaire', ar: 'شائع', en: 'Popular' },
  'detail.badge_new': { fr: 'Nouveau', ar: 'جديد', en: 'New' },
  'detail.badge_bestseller': { fr: 'Bestseller', ar: 'الأكثر مبيعاً', en: 'Bestseller' },
  'detail.interm_level': { fr: 'Intermédiaire', ar: 'متوسط', en: 'Intermediate' },
  'detail.modules_count': { fr: '12 modules (6h 30min)', ar: '12 محوراً (6 سا 30 د)', en: '12 modules (6h 30m)' },
  'detail.certif_included': { fr: 'Certificat inclus', ar: 'شهادة مدرجة', en: 'Certificate included' },
  'detail.enroll_now': { fr: 'S\'inscrire maintenant', ar: 'التسجيل الآن', en: 'Enroll now' },
  'detail.add_fav': { fr: 'Ajouter aux favoris', ar: 'إضافة للمفضلة', en: 'Add to favorites' },
  'detail.in_fav': { fr: 'Ajouté aux favoris', ar: 'في المفضلة', en: 'In favorites' },
  'detail.about_course': { fr: 'À propos de cette formation', ar: 'عن هذه الدورة التكوينية', en: 'About this course' },
  'detail.what_you_learn': { fr: 'Ce que vous allez apprendre', ar: 'ماذا ستتعلم في هذه الدورة', en: 'What you will learn' },
  'detail.who_is_it_for': { fr: 'À qui s\'adresse cette formation ?', ar: 'من المستهدف بهذه الدورة؟', en: 'Who is this course for?' },
  'detail.course_program': { fr: 'Programme de la formation', ar: 'برنامج التكوين التفصيلي', en: 'Course Curriculum' },
  'detail.your_instructor': { fr: 'Votre formatrice', ar: 'المدربة الخاصة بك', en: 'Your Instructor' },
  'detail.pricing_title': { fr: 'Tarif de la formation', ar: 'سعر التكوين', en: 'Course Pricing' },
  'detail.special_offer_ends': { fr: '⏰ Offre spéciale se termine dans :', ar: '⏰ ينتهي العرض الخاص خلال:', en: '⏰ Special offer ends in:' },
  'detail.gift_course': { fr: 'Offrir cette formation', ar: 'إهداء هذه الدورة', en: 'Gift this course' },
  'detail.includes_title': { fr: 'Cette formation inclut :', ar: 'تتضمن هذه الدورة:', en: 'This course includes:' },
  'detail.lifetime_access': { fr: 'Accès illimité à vie', ar: 'وصول غير محدود مدى الحياة', en: 'Lifetime unlimited access' },
  'detail.hd_videos': { fr: '12 modules en vidéo HD', ar: '12 محوراً بفيديو عالي الجودة', en: '12 HD video modules' },
  'detail.pdf_downloads': { fr: 'Supports téléchargeables PDF', ar: 'ملفات PDF قابلة للتحميل', en: 'Downloadable PDF resources' },
  'detail.mobile_access': { fr: 'Accès sur mobile et tablette', ar: 'مشاهدة عبر الهاتف واللوحة', en: 'Mobile & tablet access' },
  'detail.certif_name': { fr: 'Certificat de réussite nominatif', ar: 'شهادة إتمام شخصية باسمك', en: 'Personalized completion certificate' },
  'detail.guarantee_text': { fr: 'Garantie 30 jours satisfait ou remboursé.', ar: 'ضمان 30 يوماً لاسترجاع المبلغ.', en: '30-day money-back guarantee.' },

  // Consultations page
  'consultations.title': { fr: 'Réservez votre Consultation', ar: 'احجز استشارتك', en: 'Book Your Consultation' },
  'consultations.subtitle': { fr: 'Choisissez le type de consultation qui vous convient', ar: 'اختر نوع الاستشارة المناسب لك', en: 'Choose the type of consultation that suits you' },
  'consultations.individual': { fr: 'Consultation individuelle', ar: 'استشارة فردية', en: 'Individual Consultation' },
  'consultations.individual.desc': { fr: 'Un espace sécurisé pour explorer vos pensées et émotions avec un professionnel attentif.', ar: 'مساحة آمنة لاستكشاف أفكارك ومشاعرك مع متخصص منتبه.', en: 'A safe space to explore your thoughts and emotions with an attentive professional.' },
  'consultations.couple': { fr: 'Consultation de couple', ar: 'استشارة زوجية', en: 'Couple Consultation' },
  'consultations.couple.desc': { fr: 'Renforcez votre relation et améliorez votre communication en couple.', ar: 'عزز علاقتك وحسّن تواصلك الزوجي.', en: 'Strengthen your relationship and improve your communication as a couple.' },
  'consultations.family': { fr: 'Consultation familiale', ar: 'استشارة أسرية', en: 'Family Consultation' },
  'consultations.family.desc': { fr: 'Accompagnement pour restaurer l\'harmonie et l\'équilibre au sein de votre famille.', ar: 'مرافقة لاستعادة الانسجام والتوازن داخل أسرتكم.', en: 'Support to restore harmony and balance within your family.' },
  'consultations.online': { fr: 'Séance en ligne', ar: 'جلسة عن بعد', en: 'Online Session' },
  'consultations.online.desc': { fr: 'Consultez depuis chez vous via visioconférence en toute confidentialité.', ar: 'استشر من منزلك عبر مكالمة فيديو بكل سرية.', en: 'Consult from home via videoconference in complete confidentiality.' },
  
  // Consultation New Form Admin Matching
  'consultation.new_title': { fr: 'Nouvelle consultation', ar: 'استشارة جديدة', en: 'New Consultation' },
  'form.patient_name': { fr: 'Nom du patient', ar: 'اسم المريض', en: 'Patient Name' },
  'form.patient_phone': { fr: 'Numéro de téléphone', ar: 'رقم الهاتف', en: 'Phone Number' },
  'form.address': { fr: 'Adresse résidentielle', ar: 'العنوان السكني', en: 'Residential Address' },
  'form.email_optional': { fr: 'Adresse e-mail (facultatif)', ar: 'البريد الإلكتروني (اختياري)', en: 'Email Address (optional)' },
  'form.consultation_type_label': { fr: 'Type de consultation', ar: 'نوع الاستشارة', en: 'Consultation Type' },
  'form.mode.presentielle_btn': { fr: 'Présentielle', ar: 'حضورية', en: 'In-person' },
  'form.mode.online_btn': { fr: 'En ligne', ar: 'عبر الإنترنت', en: 'Online' },
  'form.session_duration_label': { fr: 'Durée de la séance', ar: 'مدة الجلسة', en: 'Session Duration' },
  'form.duration_30': { fr: '30 min', ar: '30 دقيقة', en: '30 min' },
  'form.duration_45': { fr: '45 min', ar: '45 دقيقة', en: '45 min' },
  'form.duration_60': { fr: '1 heure', ar: 'ساعة واحدة', en: '1 hour' },
  'form.notes_optional': { fr: 'Remarques ou détails (facultatif)', ar: 'ملاحظات أو تفاصيل (اختياري)', en: 'Notes or details (optional)' },
  'form.save_reservation': { fr: 'Enregistrer la réservation', ar: 'حفظ واستكمال الحجز', en: 'Save Reservation' },
  'form.another_reservation': { fr: 'Autre réservation', ar: 'حجز موعد آخر', en: 'Another Reservation' },

  // Form labels
  'form.name': { fr: 'Nom complet', ar: 'الاسم الكامل', en: 'Full Name' },
  'form.phone': { fr: 'Téléphone', ar: 'رقم الهاتف', en: 'Phone Number' },
  'form.email': { fr: 'Email', ar: 'البريد الإلكتروني', en: 'Email Address' },
  'form.date': { fr: 'Date', ar: 'التاريخ', en: 'Date' },
  'form.time': { fr: 'Heure', ar: 'الوقت', en: 'Time' },
  'form.notes': { fr: 'Notes / Message', ar: 'ملاحظات / رسالة', en: 'Notes / Message' },
  'form.mode': { fr: 'Mode de consultation', ar: 'طريقة الاستشارة', en: 'Consultation Mode' },
  'form.mode.presentiel': { fr: 'Présentiel (au centre)', ar: 'حضوري (في المركز)', en: 'In-person (at the center)' },
  'form.mode.online': { fr: 'En ligne (visioconférence)', ar: 'عن بعد (مكالمة فيديو)', en: 'Online (videoconference)' },
  'form.contact_pref': { fr: 'Préférence de contact', ar: 'طريقة التواصل المفضلة', en: 'Preferred Contact Method' },
  'form.submit': { fr: 'Envoyer la demande', ar: 'إرسال الطلب', en: 'Submit Request' },
  'form.submitting': { fr: 'Envoi en cours...', ar: 'جاري الإرسال...', en: 'Sending...' },
  'form.required': { fr: 'Champ obligatoire', ar: 'حقل إجباري', en: 'Required field' },
  'form.register': { fr: "S'inscrire à cette formation", ar: 'التسجيل في هذا التكوين', en: 'Register for this training' },

  // Success
  'success.reservation': { fr: 'Votre demande a été envoyée avec succès !', ar: 'تم إرسال طلبك بنجاح!', en: 'Your request has been submitted successfully!' },
  'success.reservation.desc': { fr: 'Nous vous contacterons dans les plus brefs délais pour confirmer votre rendez-vous.', ar: 'سنتواصل معكم في أقرب وقت لتأكيد موعدكم.', en: 'We will contact you as soon as possible to confirm your appointment.' },
  'reservation.code': { fr: 'Code de réservation', ar: 'رمز حجز الموعد', en: 'Reservation Code' },
  'form.error.required': { fr: 'Veuillez remplir tous les champs obligatoires (*)', ar: 'يرجى ملء جميع الحقول الإجبارية (*)', en: 'Please fill in all required fields (*)' },
  'form.error.submit': { fr: 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.', ar: 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.', en: 'An error occurred during submission. Please try again.' },
  'success.inscription': { fr: 'Votre inscription a été enregistrée !', ar: 'تم تسجيل طلب انضمامك!', en: 'Your registration has been recorded!' },
  'success.inscription.desc': { fr: 'Notre équipe vous contactera pour les détails et le paiement.', ar: 'سيتواصل معكم فريقنا بخصوص التفاصيل والدفع.', en: 'Our team will contact you regarding details and payment.' },
  'success.back': { fr: 'Retour à l\'accueil', ar: 'العودة للرئيسية', en: 'Back to Home' },
  
  // Inscription Modal Form & Success Screen (Français, العربية, English)
  'inscription.success_title': { 
    fr: 'Inscription enregistrée avec succès !', 
    ar: 'تم تسجيل طلب انضمامك بنجاح!', 
    en: 'Registration Successful!' 
  },
  'inscription.success_desc': { 
    fr: 'Conservez précieusement vos identifiants pour accéder à vos cours dans l\'Espace Étudiant.', 
    ar: 'احتفظ بمعلومات الدخول الخاصة بك للوصول إلى دروسك في فضاء الطالب.', 
    en: 'Keep your login credentials safe to access your courses in the Student Space.' 
  },
  'inscription.tracking_label': { 
    fr: 'N° de suivi (Tracking ID)', 
    ar: 'رقم التتبع (Tracking ID)', 
    en: 'Tracking Number (ID)' 
  },
  'inscription.password_label': { 
    fr: 'Mot de passe d\'accès aux cours', 
    ar: 'كلمة المرور للدورة', 
    en: 'Course Access Password' 
  },
  'inscription.notice_save_codes': { 
    fr: 'Important : Notez bien votre numéro de suivi et mot de passe. Ils vous seront demandés pour vous connecter à l\'Espace Étudiant.', 
    ar: 'هام جداً: يرجى حفظ رقم التتبع وكلمة المرور جيداً لاستخدامهما في الدخول لفضاء الطالب.', 
    en: 'Important: Make sure to save your tracking number and password. You will need them to log in to the Student Space.' 
  },
  'inscription.done_btn': { 
    fr: 'J\'ai bien noté mes identifiants', 
    ar: 'تم، حفظت بيانات الدخول', 
    en: 'Done, I saved my credentials' 
  },
  'inscription.name_label': { 
    fr: 'Nom et prénom du participant', 
    ar: 'الاسم واللقب', 
    en: 'Participant Full Name' 
  },
  'inscription.name_placeholder': { 
    fr: 'Ex: Mohamed Benali', 
    ar: 'مثال: محمد بن علي', 
    en: 'e.g. John Doe' 
  },
  'inscription.phone_label': { 
    fr: 'Numéro de téléphone', 
    ar: 'رقم الهاتف', 
    en: 'Phone Number' 
  },
  'inscription.phone_placeholder': { 
    fr: 'Ex: 0550 00 00 00', 
    ar: '0550 00 00 00', 
    en: '0550 00 00 00' 
  },
  'inscription.email_label': { 
    fr: 'Adresse e-mail (optionnel)', 
    ar: 'البريد الإلكتروني (اختياري)', 
    en: 'Email Address (optional)' 
  },
  'inscription.email_placeholder': { 
    fr: 'exemple@email.com', 
    ar: 'exemple@email.com', 
    en: 'example@email.com' 
  },
  'inscription.participant_name': { fr: 'Nom et prénom du participant', ar: 'اسم المشارك الكامل', en: 'Participant Full Name' },
  'inscription.participant_phone': { fr: 'Numéro de téléphone', ar: 'رقم الهاتف', en: 'Phone Number' },
  'inscription.participant_email': { fr: 'Adresse e-mail (optionnel)', ar: 'البريد الإلكتروني (اختياري)', en: 'Email address (optional)' },
  'inscription.notes_label': { fr: 'Remarques ou questions (optionnel)', ar: 'ملاحظات أو استفسارات (اختياري)', en: 'Notes or questions (optional)' },
  'inscription.notes_placeholder': { fr: 'Avez-vous des remarques ou des questions particulières ?', ar: 'هل لديك أي استفسارات أو ملاحظات خاصة؟', en: 'Do you have any questions or special notes?' },
  'inscription.fee_label': { fr: 'Frais de formation :', ar: 'رسوم التكوين :', en: 'Course fee:' },
  'inscription.tracking': { fr: 'N° de suivi', ar: 'رقم التتبع', en: 'Tracking No.' },

  // Espace Étudiant (Student Space)
  'student.title': { fr: '🎓 Espace Étudiant — Mes Cours', ar: '🎓 فضاء الطالب — الوصول للدروس', en: '🎓 Student Space — My Courses' },
  'student.subtitle': { fr: 'Saisissez votre code d\'inscription et votre mot de passe pour voir vos cours', ar: 'أدخل كود التسجيل وكلمة المرور الخاصة بك لعرض دروس الدورة', en: 'Enter your registration code and access password to view your courses' },
  'student.tracking_label': { fr: 'Code d\'inscription (Tracking ID)', ar: 'كود التسجيل (Tracking ID)', en: 'Registration Code (Tracking ID)' },
  'student.password_label': { fr: 'Mot de passe d\'accès', ar: 'كلمة المرور للدورة', en: 'Access Password' },
  'student.submit_btn': { fr: 'Vérifier et accéder au cours', ar: 'التحقق والدخول إلى الدورة', en: 'Verify and access course' },
  'student.err_required': { fr: 'Veuillez saisir le code d\'inscription et le mot de passe', ar: 'يرجى إدخال كود التسجيل وكلمة المرور', en: 'Please enter both registration code and password' },
  'student.err_not_found': { fr: 'Aucune inscription trouvée avec ce code', ar: 'لم يتم العثور على أي تسجيل بهذا الكود', en: 'No registration found with this code' },
  'student.err_wrong_pass': { fr: 'Mot de passe d\'accès incorrect', ar: 'كلمة المرور غير صحيحة', en: 'Incorrect access password' },
  'student.err_generic': { fr: 'Erreur lors de la vérification', ar: 'حدث خطأ أثناء التحقق', en: 'Error during verification' },
  'student.pending_badge': { fr: '⏳ Inscription en Attente de Validation', ar: '⏳ التسجيل قيد تأكيد الدفع', en: '⏳ Registration Awaiting Payment Confirmation' },
  'student.pending_title': { fr: 'Votre inscription est bien enregistrée, mais les cours sont verrouillés.', ar: 'تم تسجيل طلبك بنجاح ولكن الفيديوهات مقفلة حالياً.', en: 'Your registration is recorded, but course videos are locked.' },
  'student.pending_desc': { fr: 'L\'accès aux vidéos YouTube et aux documents sera automatiquement débloqué dès que l\'administration aura validé votre paiement (BaridiMob, CCP ou espèces).', ar: 'سيتم تفعيل وعرض مقاطع الفيديو والدروس فور قيام إدارة قلبي اطمئنان بتأكيد استلام الدفع (عبر BaridiMob أو CCP أو نقداً في المركز).', en: 'Access to YouTube videos and materials will be unlocked automatically once administration verifies your payment (BaridiMob, CCP or cash).' },
  'student.whatsapp_btn': { fr: 'Envoyer mon reçu sur WhatsApp pour accélérer l\'activation', ar: 'إرسال وصل الدفع عبر واتساب لتسريع التفعيل', en: 'Send payment receipt via WhatsApp to accelerate activation' },
  'student.switch_account': { fr: 'Se connecter avec un autre compte', ar: 'تسجيل الدخول برقم آخر', en: 'Log in with another account' },
  'student.change_student': { fr: 'Changer d\'étudiant', ar: 'تغيير الحساب', en: 'Change student' },
  'student.unlocked_badge': { fr: 'Accès Validé & Débloqué', ar: 'تم تأكيد الاشتراك — وصول كامل', en: 'Access Validated & Unlocked' },
  'student.unlocked_subtitle': { fr: 'Bon apprentissage ! Vous avez accès à l\'ensemble des vidéos et ressources.', ar: 'نتمنى لك تكويناً موفقاً وممتعاً! يمكنك الآن متابعة جميع الدروس والموارد.', en: 'Enjoy your learning! You have full access to videos and materials.' },
  'student.video_title': { fr: '🎥 Vidéos de la formation (Lecture directe)', ar: '🎥 مشاهدة دروس الدورة (YouTube Unlisted)', en: '🎥 Course Videos (Direct Player)' },
  'student.video_desc': { fr: 'Ces vidéos sont exclusivement réservées aux inscrits de Qalbi ITMAAN. Vous pouvez naviguer dans la playlist si plusieurs vidéos sont incluses.', ar: 'هذه الدروس خاصة وحصرية بالمشاركين المسجلين في قلبي اطمأن. يمكنك التنقل بين الفيديوهات في حال وجود قائمة تشغيل.', en: 'These videos are exclusively for enrolled students. You can navigate the playlist if multiple lessons are included.' },
  'student.drive_title': { fr: '📁 Documents & Supports de cours (Google Drive)', ar: '📁 ملفات وموارد الدورة (Google Drive)', en: '📁 Documents & Course Materials (Google Drive)' },
  'student.drive_desc': { fr: 'Téléchargez les fiches pratiques, présentations et exercices mis à disposition par le formateur.', ar: 'حمّل الملخصات والتمارين والعروض التقديمية المرفقة مع هذا التكوين.', en: 'Download handouts, slides, and exercises provided by the instructor.' },
  'student.drive_download': { fr: 'Télécharger les fichiers', ar: 'تحميل ملفات الدورة', en: 'Download files' },
  'student.drive_open': { fr: 'Ouvrir dans Google Drive ↗', ar: 'فتح في Google Drive ↗', en: 'Open in Google Drive ↗' },
  'student.empty_title': { fr: 'Contenu en cours de préparation', ar: 'الدروس ستكون متاحة قريباً', en: 'Content in preparation' },
  'student.empty_desc': { fr: 'Les liens vidéo et documents sont en cours de mise en ligne par l\'administration.', ar: 'يقوم المشرف بإعداد وتحديث روابط الفيديوهات للدورة. يرجى التواصل مع الإدارة لمزيد من التفاصيل.', en: 'Video links and resources are currently being uploaded by the administration.' },

  // About
  'about.title': { fr: 'À propos de Qalbi Itmaan', ar: 'من نحن — قلبي اطمأن', en: 'About Qalbi Itmaan' },
  'about.vision.title': { fr: 'Notre Vision', ar: 'رؤيتنا', en: 'Our Vision' },
  'about.vision.text': { fr: 'Être la référence en accompagnement familial et éducatif en Algérie, en offrant un espace de confiance où chaque famille peut retrouver l\'harmonie et la sérénité, sous la direction de l\'Ustadha Oum Dorra Cherichi.', ar: 'أن نكون المرجع في الإرشاد الأسري والتربوي في الجزائر، من خلال فضاء آمن تسترجع فيه كل أسرة الانسجام والطمأنينة، بإشراف الأستاذة أم درة شريشي.', en: 'To be the reference for family and educational counseling in Algeria, providing a trusted space where every family can find harmony and serenity, under Ustadha Oum Dorra Cherichi\'s guidance.' },
  'about.mission.title': { fr: 'Notre Mission', ar: 'رسالتنا', en: 'Our Mission' },
  'about.mission.text': { fr: 'Accompagner les individus, les couples et les familles grâce à des consultations en médiation conjugale, en éducation positive et en développement personnel. Nos formations et ateliers renforcent les compétences parentales et la communication au sein du foyer.', ar: 'مرافقة الأفراد والأزواج والأسر من خلال استشارات في إصلاح ذات البين، التربية الإيجابية وتطوير الذات. تكويناتنا وورشاتنا تعزز المهارات الوالدية والتواصل الأسري.', en: 'To support individuals, couples and families through consultations in family mediation, positive parenting, and personal development. Our trainings and workshops strengthen parental skills and family communication.' },
  'about.values.title': { fr: 'Nos Valeurs', ar: 'قيمنا', en: 'Our Values' },
  'about.promise': { fr: '- لأجل بيوت مطمئنة -', ar: '- لأجل بيوت مطمئنة -', en: '- For peaceful homes -' },

  'value.bienveillance': { fr: 'Bienveillance', ar: 'الرحمة واللطف', en: 'Kindness' },
  'value.confiance': { fr: 'Confiance', ar: 'الثقة', en: 'Trust' },
  'value.famille': { fr: 'Famille', ar: 'الأسرة', en: 'Family' },
  'value.expertise': { fr: 'Expertise', ar: 'الخبرة', en: 'Expertise' },
  'value.serenite': { fr: 'Sérénité', ar: 'الطمأنينة', en: 'Serenity' },
  'value.ecoute': { fr: 'Écoute', ar: 'الإصغاء', en: 'Listening' },
  'value.formation': { fr: 'Formation', ar: 'التكوين', en: 'Training' },
  'value.developpement': { fr: 'Développement', ar: 'التطوير', en: 'Development' },

  // Contact
  'contact.title': { fr: 'Contactez-nous', ar: 'تواصل معنا', en: 'Contact Us' },
  'contact.subtitle': { fr: 'Nous sommes à votre écoute', ar: 'نحن في خدمتكم', en: 'We are here to listen' },
  'contact.address': { fr: 'Adresse du centre', ar: 'عنوان المركز', en: 'Center Address' },
  'contact.address.value': { fr: 'Bouzaréah, Alger, Algérie', ar: 'بوزريعة، الجزائر العاصمة', en: 'Bouzareah, Algiers, Algeria' },
  'contact.phone': { fr: 'Téléphone', ar: 'الهاتف', en: 'Phone' },
  'contact.email': { fr: 'Email', ar: 'البريد الإلكتروني', en: 'Email' },
  'contact.hours': { fr: 'Horaires', ar: 'أوقات العمل', en: 'Hours' },
  'contact.hours.value': { fr: 'Dimanche – Jeudi : 9h – 17h', ar: 'الأحد – الخميس: 9:00 – 17:00', en: 'Sunday – Thursday: 9 AM – 5 PM' },
  'contact.message': { fr: 'Envoyez-nous un message', ar: 'أرسل لنا رسالة', en: 'Send us a message' },
  'contact.send': { fr: 'Envoyer', ar: 'إرسال', en: 'Send' },

  // WhatsApp Contact
  'contact.whatsapp.title': { fr: 'Discussion rapide WhatsApp', ar: 'محادثة سريعة عبر واتساب', en: 'Fast WhatsApp Chat' },
  'contact.whatsapp.desc': { fr: 'Une réponse directe en moins de 15 minutes.', ar: 'إجابة مباشرة في أقل من 15 دقيقة.', en: 'A direct response in under 15 minutes.' },
  'contact.whatsapp.btn': { fr: 'Discuter sur WhatsApp', ar: 'محادثة عبر واتساب', en: 'Chat on WhatsApp' },
  'contact.success': { fr: 'Votre message a été transmis avec succès à notre équipe !', ar: 'تم إرسال رسالتكم بنجاح إلى فريقنا!', en: 'Your message has been successfully sent to our team!' },
  'stats.years_experience': { fr: 'Ans d\'expérience dédiée', ar: 'سنوات من الخبرة والعطاء', en: 'Years of dedicated experience' },
  'detail.whatsapp_inquiry': { fr: 'Poser une question sur WhatsApp', ar: 'استفسار سريع عبر واتساب', en: 'Ask a question on WhatsApp' },
  'form.address_optional_online': { fr: 'facultatif pour consultation en ligne', ar: 'اختياري للاستشارة عن بعد', en: 'optional for online consultation' },

  // Common & UI Elements
  'common.loading': { fr: 'Chargement en cours...', ar: 'جاري التحميل...', en: 'Loading...' },
  'common.back_to_catalog': { fr: 'Retour au catalogue', ar: 'العودة إلى الدليل', en: 'Back to catalog' },
  'common.formation_not_found': { fr: 'Formation non trouvée', ar: 'التكوين غير موجود', en: 'Course not found' },
  'common.formation_not_found_desc': { fr: 'La formation demandée n\'existe pas ou n\'est plus disponible.', ar: 'التكوين المطلوب غير موجود أو لم يعد متاحاً.', en: 'The requested course does not exist or is no longer available.' },
  'common.share_copied': { fr: 'Lien copié dans le presse-papier !', ar: 'تم نسخ الرابط إلى الحافظة!', en: 'Link copied to clipboard!' },

  // Navigation & Badges
  'nav.student_space': { fr: 'Espace Étudiant', ar: 'فضاء الطالب', en: 'Student Space' },
  'home.book_consultation': { fr: 'Réserver une consultation', ar: 'حجز استشارة', en: 'Book a Consultation' },

  // Formation Levels & Types
  'level.beginner': { fr: 'Débutant', ar: 'مبتدئ', en: 'Beginner' },
  'level.intermediate': { fr: 'Intermédiaire', ar: 'متوسط', en: 'Intermediate' },
  'level.advanced': { fr: 'Avancé', ar: 'متقدم', en: 'Advanced' },
  'type.presentiel': { fr: 'Présentiel', ar: 'حضوري', en: 'Onsite' },
  'type.online': { fr: 'En ligne', ar: 'عن بعد', en: 'Online' },
  'type.hybrid': { fr: 'Hybride', ar: 'هجين', en: 'Hybrid' },
  'price.fee_label': { fr: 'Tarif :', ar: 'رسوم التكوين:', en: 'Fee:' },

  // Formation Detail Page Tabs & Sections
  'detail.tab.apercu': { fr: 'Aperçu', ar: 'نظرة عامة', en: 'Overview' },
  'detail.tab.curriculum': { fr: 'Programme', ar: 'البرنامج', en: 'Curriculum' },
  'detail.tab.instructor': { fr: 'Formatrice', ar: 'المدربة', en: 'Instructor' },
  'detail.tab.reviews': { fr: 'Avis (256)', ar: 'التقييمات (256)', en: 'Reviews (256)' },
  'detail.tab.faq': { fr: 'FAQ', ar: 'الأسئلة الشائعة', en: 'FAQ' },
  'detail.based_on_reviews': { fr: 'Basé sur 256 avis', ar: 'بناءً على 256 تقييماً', en: 'Based on 256 reviews' },
  'detail.instructor_title': { fr: 'Conseillère familiale & éducative', ar: 'استشارية أسرية وتربوية', en: 'Family & Educational Counselor' },
  'detail.instructor_bio': { fr: 'Spécialiste en thérapie familiale et communication avec plus de 10 ans d\'expérience dans l\'accompagnement des familles et des couples.', ar: 'أخصائية في الإرشاد الأسري والتواصل التربوي بخبرة تزيد عن 10 سنوات في مرافقة الأسر والأزواج.', en: 'Specialist in family guidance and communication with over 10 years of experience supporting families and couples.' },

  // About Page
  'about.subtitle_desc': { fr: 'Centre Qalbi Itmaan pour le conseil familial & éducatif — Bouzaréah, Alger', ar: 'مركز قلبي اطمأن للإرشاد الأسري والتربوي والتكوين — بوزريعة، الجزائر العاصمة', en: 'Qalbi Itmaan Center for Family & Educational Guidance — Bouzaréah, Algiers' },
  'about.founder_badge': { fr: 'Fondatrice & Conseillère Principale', ar: 'المؤسسة والمستشارة الرئيسية', en: 'Founder & Senior Counselor' },
  'about.founder_name': { fr: 'Mme. Oum Dorra Cherichi', ar: 'الأستاذة أم درة شريشي', en: 'Ms. Oum Dorra Cherichi' },
  'about.founder_bio': { fr: 'Conseillère familiale et éducative chevronnée, spécialisée dans la médiation conjugale, la gestion des conflits familiaux, l\'éducation bienveillante et l\'accompagnement des adolescents.', ar: 'استشارية أسرية وتربوية جزائرية متميزة، خبرة واسعة ومتخصصة في إصلاح ذات البين، مرافقة الأزواج، حل الخلافات الأسرية، التربية الإيجابية للأطفال، وتعديل سلوك المراهقين.', en: 'Experienced Algerian family and educational counselor specializing in marriage mediation, family conflict resolution, positive parenting, and adolescent behavior.' },
  'about.stat_rating': { fr: '★ 4.9 (350+ consultations)', ar: '★ 4.9 (350+ استشارة)', en: '★ 4.9 (350+ consultations)' },
  'about.feature_mediation': { fr: 'Médiation conjugale & familiale', ar: 'إصلاح ذات البين والميثاق الغليظ', en: 'Marriage & Family Mediation' },
  'about.feature_education': { fr: 'Éducation positive & comportement', ar: 'التربية الإيجابية وتعديل السلوك', en: 'Positive Parenting & Behavior' },
  'about.feature_onsite': { fr: 'Consultations à Bouzaréah', ar: 'استشارات حضورية بـ بوزريعة', en: 'In-person sessions in Bouzaréah' },
  'about.feature_online': { fr: 'Séances en ligne sécurisées', ar: 'جلسات عن بعد عبر الإنترنت', en: 'Secure online sessions' },
  'about.hq_location': { fr: 'Siège social : Bouzaréah, Alger, Algérie', ar: 'المقر الرئيسي: بوزريعة، الجزائر العاصمة', en: 'Headquarters: Bouzaréah, Algiers, Algeria' },

  // Contact Page
  'contact.send_another': { fr: 'Envoyer un autre message', ar: 'إرسال رسالة أخرى', en: 'Send another message' },

  // Consultations Page
  'consultation.address_placeholder_online': { fr: 'Wilaya ou ville (facultatif)', ar: 'الولاية أو المدينة (اختياري)', en: 'State or city (optional)' },

  // Testimonials (Trilingual)
  'testimonial.1.quote': {
    fr: '"Grâce à notre consultation avec Mme Oum Dorra Cherichi, nous avons appris à communiquer avec bienveillance et à surmonter nos différends avec beaucoup de sagesse."',
    ar: '"بفضل الاستشارة مع الأستاذة أم درة شريشي، تعلمنا كيفية التواصل الإيجابي وتجاوز الخلافات بحكمة وتفهم كبير."',
    en: '"Thanks to our counseling with Ms. Oum Dorra Cherichi, we learned compassionate communication and how to overcome conflicts with wisdom and empathy."'
  },
  'testimonial.1.author': { fr: 'Sarah & Karim', ar: 'سارة وكريم', en: 'Sarah & Karim' },
  'testimonial.2.quote': {
    fr: '"Les formations et consultations sont remarquables et très enrichissantes. Je les recommande à tous les parents qui souhaitent bâtir un foyer serein et épanoui."',
    ar: '"التكوينات والاستشارات رائعة جداً ومفيدة. أنصح بها كل أم وأب يطمحون لبناء أسرة هادئة ومتوازنة."',
    en: '"The courses and counseling are outstanding and deeply helpful. I recommend them to every parent aiming to build a peaceful and balanced home."'
  },
  'testimonial.2.author': { fr: 'Fatima Zohra', ar: 'فاطمة الزهراء', en: 'Fatima Zohra' },
  'testimonial.3.quote': {
    fr: '"Un accompagnement professionnel et chaleureux, on se sent en confiance, écouté en profondeur et guidé avec une grande bienveillance."',
    ar: '"مرافقة احترافية ومتميزة جداً، تشعر بالأمان والإنصات العميق والتوجيه الصائب."',
    en: '"Professional and compassionate guidance; you feel safe, deeply heard, and guided with genuine care."'
  },
  'testimonial.3.author': { fr: 'Amina B.', ar: 'أمينة ب.', en: 'Amina B.' },

  // Footer Location
  'footer.location': { fr: 'Bouzaréah, Alger, Algérie', ar: 'بوزريعة، الجزائر العاصمة', en: 'Bouzaréah, Algiers, Algeria' },
  'footer.description': { fr: 'Centre spécialisé en conseil familial, éducation et formation.', ar: 'مركز متخصص في الإرشاد الأسري والتربوي والتكوين.', en: 'Center specialized in family counseling, education, and training.' },
  'footer.links': { fr: 'Liens rapides', ar: 'روابط سريعة', en: 'Quick Links' },
  'footer.services': { fr: 'Services', ar: 'خدمات', en: 'Services' },
  'footer.contact': { fr: 'Contact', ar: 'اتصل بنا', en: 'Contact' },
  'footer.rights': { fr: '© 2026 Qalbi Itmaan. Tous droits réservés.', ar: '© 2026 قلبي اطمأن. جميع الحقوق محفوظة.', en: '© 2026 Qalbi Itmaan. All rights reserved.' },
  'footer.slogan': { fr: '- Pour des foyers apaisés -', ar: '- لأجل بيوت مطمئنة -', en: '- For peaceful homes -' },

  // Currency
  'currency': { fr: 'DZD', ar: 'د.ج', en: 'DZD' },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const getInitialLang = (): Lang => {
  const local = localStorage.getItem('qalbi_lang');
  if (local === 'fr' || local === 'ar' || local === 'en') return local;

  const sys = (navigator.language || '').toLowerCase();
  if (sys.startsWith('ar')) return 'ar';
  if (sys.startsWith('en')) return 'en';
  return 'fr';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('qalbi_lang', newLang);
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => {
    const translationSet = translations[key];
    if (!translationSet) return key;
    return translationSet[lang] || translationSet['fr'] || key;
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
}
