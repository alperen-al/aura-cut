/**
 * Günün sporcusu. Fotoğraf ve biyografi her gün Wikipedia'dan canlı çekilir (lib/wiki.ts);
 * sözler sporculara yaygın olarak atfedilen kısa alıntılardır.
 */
export interface Athlete {
  id: string;
  name: string;
  /** Wikipedia sayfa başlığı (önce tr, yoksa en) */
  wiki: string;
  sport: string;
  quote: string;
  original: string;
  /** Günün diyet görevine bağlanan kısa çağrı */
  mission: string;
  video: string;
}

export const ATHLETES: Athlete[] = [
  {
    id: "ali",
    name: "Muhammad Ali",
    wiki: "Muhammad Ali",
    sport: "Boks",
    quote:
      "Antrenmanın her dakikasından nefret ettim ama kendime dedim ki: Bırakma. Şimdi acı çek, hayatının geri kalanını şampiyon olarak yaşa.",
    original: "Don't quit. Suffer now and live the rest of your life as a champion.",
    mission: "Bugün acı çekeceğin yer mutfak: bandın içinde kal.",
    video: "Muhammad Ali training motivation",
  },
  {
    id: "arnold",
    name: "Arnold Schwarzenegger",
    wiki: "Arnold Schwarzenegger",
    sport: "Vücut geliştirme",
    quote: "Kası büyüten, son üç dört tekrardır.",
    original: "The last three or four reps is what makes the muscle grow.",
    mission: "Günün son öğünü de son tekrar gibidir: proteini tamamla.",
    video: "Arnold Schwarzenegger Pumping Iron motivation",
  },
  {
    id: "jordan",
    name: "Michael Jordan",
    wiki: "Michael Jordan",
    sport: "Basketbol",
    quote: "Hayatım boyunca tekrar tekrar başarısız oldum. İşte bu yüzden başarılıyım.",
    original: "I've failed over and over and over again in my life. And that is why I succeed.",
    mission: "Dün kaçırdıysan sorun yok; bugün yeniden 2000–2200.",
    video: "Michael Jordan motivation",
  },
  {
    id: "coleman",
    name: "Ronnie Coleman",
    wiki: "Ronnie Coleman",
    sport: "Vücut geliştirme",
    quote: "Herkes vücut geliştirmeci olmak ister ama kimse o ağır ağırlıkları kaldırmak istemez.",
    original: "Everybody wants to be a bodybuilder, but nobody wants to lift heavy weights.",
    mission: "Light weight, baby! Bugün protein ağır, kalori hafif olsun.",
    video: "Ronnie Coleman training motivation",
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    wiki: "Cristiano Ronaldo",
    sport: "Futbol",
    quote: "Çalışmadan yetenek hiçbir şeydir.",
    original: "Talent without working hard is nothing.",
    mission: "Disiplin günü: tartı, takviye, su — üçünü de işaretle.",
    video: "Cristiano Ronaldo training motivation",
  },
  {
    id: "serena",
    name: "Serena Williams",
    wiki: "Serena Williams",
    sport: "Tenis",
    quote: "Bir şampiyonu kazandıkları değil, düştüğünde nasıl toparlandığı tanımlar.",
    original: "A champion is defined not by their wins but by how they can recover when they fall.",
    mission: "Telafi günündeysen bu söz senin için: toparlanma zamanı.",
    video: "Serena Williams motivation",
  },
  {
    id: "phelps",
    name: "Michael Phelps",
    wiki: "Michael Phelps",
    sport: "Yüzme",
    quote: "Hiçbir şeye sınır koyamazsın. Ne kadar çok hayal edersen o kadar ileri gidersin.",
    original: "You can't put a limit on anything. The more you dream, the farther you get.",
    mission: "Hayal: 80 kg. Bugünkü adım: 3,5 L su.",
    video: "Michael Phelps training motivation",
  },
  {
    id: "kipchoge",
    name: "Eliud Kipchoge",
    wiki: "Eliud Kipchoge",
    sport: "Maraton",
    quote: "Hiçbir insan sınırlı değildir.",
    original: "No human is limited.",
    mission: "Definasyon bir maraton: bugün sadece tempoyu koru.",
    video: "Eliud Kipchoge motivation",
  },
  {
    id: "rock",
    name: "Dwayne Johnson",
    wiki: "Dwayne Johnson",
    sport: "Güreş / Fitness",
    quote: "Başarı her zaman büyüklükle ilgili değildir. Tutarlılıkla ilgilidir.",
    original: "Success isn't always about greatness. It's about consistency.",
    mission: "Tutarlılık = seri. Bugün de yeşil gün olsun.",
    video: "Dwayne Johnson workout motivation",
  },
  {
    id: "tyson",
    name: "Mike Tyson",
    wiki: "Mike Tyson",
    sport: "Boks",
    quote: "Disiplin, nefret ettiğin şeyi seviyormuş gibi yapmaktır.",
    original: "Discipline is doing what you hate to do, but doing it like you love it.",
    mission: "Sevmesen de: sabah tartısı, aç karnına.",
    video: "Mike Tyson training motivation",
  },
  {
    id: "pele",
    name: "Pelé",
    wiki: "Pelé",
    sport: "Futbol",
    quote: "Başarı tesadüf değildir. Sıkı çalışma, azim, öğrenme, fedakârlık ve en çok da yaptığın işi sevmektir.",
    original:
      "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.",
    mission: "Fedakârlık bugün tek bir şey: ekstra kutusunu boş bırak.",
    video: "Pelé best moments",
  },
  {
    id: "gretzky",
    name: "Wayne Gretzky",
    wiki: "Wayne Gretzky",
    sport: "Buz hokeyi",
    quote: "Atmadığın şutların yüzde yüzünü kaçırırsın.",
    original: "You miss 100% of the shots you don't take.",
    mission: "Tartılmadığın günü ölçemezsin. Bugün tartıl.",
    video: "Wayne Gretzky highlights",
  },
  {
    id: "bruce",
    name: "Bruce Lee",
    wiki: "Bruce Lee",
    sport: "Dövüş sanatları",
    quote: "10.000 farklı tekmeyi bir kez atandan korkmam; tek bir tekmeyi 10.000 kez atandan korkarım.",
    original: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.",
    mission: "Aynı kombo, her gün. Tekrar ustalaştırır.",
    video: "Bruce Lee training",
  },
  {
    id: "kobe",
    name: "Kobe Bryant",
    wiki: "Kobe Bryant",
    sport: "Basketbol",
    quote: "Dinlenmek sonda olur, ortada değil.",
    original: "Rest at the end, not in the middle.",
    mission: "Haftanın ortasında gevşeme; serbest öğün 10. günde.",
    video: "Kobe Bryant mamba mentality",
  },
  {
    id: "rice",
    name: "Jerry Rice",
    wiki: "Jerry Rice",
    sport: "Amerikan futbolu",
    quote: "Bugün başkalarının yapmayacağını yapacağım ki yarın başkalarının yapamayacağını başarayım.",
    original: "Today I will do what others won't, so tomorrow I can accomplish what others can't.",
    mission: "Başkaları atıştırırken sen yüksek protein seç.",
    video: "Jerry Rice workout",
  },
  {
    id: "messi",
    name: "Lionel Messi",
    wiki: "Lionel Messi",
    sport: "Futbol",
    quote: "Hayaline ulaşmak için savaşmalısın. Fedakârlık yapmalı ve çok çalışmalısın.",
    original: "You have to fight to reach your dream. You have to sacrifice and work hard for it.",
    mission: "Hedef 80. Bugünkü fedakârlık 2200'ü geçmemek.",
    video: "Lionel Messi motivation",
  },
];

/** Tarihe göre deterministik seçim: her gün farklı, herkes için aynı gün aynı sporcu */
export const athleteIndexFor = (dateKey: string) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dayNum = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  return (((dayNum * 7) % ATHLETES.length) + ATHLETES.length) % ATHLETES.length;
};
