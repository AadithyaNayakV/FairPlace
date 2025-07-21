// const axios = require("axios");
// require("dotenv").config();

// const HF_TOKEN = process.env.HF_TOKEN;
// if (!HF_TOKEN) throw new Error("Missing HF_TOKEN in .env");

// // Models
// const NSFW_MODEL = "Falconsai/nsfw_image_detection";
// const DETR_MODEL = "facebook/detr-resnet-50";
// const CAPTION_MODEL = "Salesforce/blip-image-captioning-base";

// // Allowed object classes considered "product-ish"
// const PRODUCT_OBJECTS = new Set([
//   "cell phone","laptop","keyboard","mouse","remote","tv",
//   "bottle","cup","chair","couch","bed","dining table",
//   "backpack","handbag","suitcase","book","clock","vase",
//   "scissors","toothbrush","refrigerator","microwave","oven",
//   "toaster","sink","bench","skateboard","surfboard","tennis racket",
//   "hair drier","sneaker","sports shoe","shoe","boots","sandals"
// ]);

// async function hfPost(model, data, contentType="application/octet-stream") {
//   const url = `https://api-inference.huggingface.co/models/${model}`;
//   const resp = await axios.post(url, data, {
//     headers: {
//       Authorization: `Bearer ${HF_TOKEN}`,
//       "Content-Type": contentType
//     },
//     timeout: 60000
//   });
//   return resp.data;
// }

// /** Step 1: NSFW score */
// async function detectNsfw(buffer) {
//   try {
//     const out = await hfPost(NSFW_MODEL, buffer);
//     // out = [{label:"nsfw",score:0.01},{label:"neutral",score:0.99}] format varies but similar
//     let nsfw = 0;
//     if (Array.isArray(out)) {
//       for (const r of out) {
//         if (typeof r?.label === "string" && r.label.toLowerCase().includes("nsfw")) {
//           nsfw = r.score ?? 0;
//         }
//       }
//     }
//     return { nsfwScore: nsfw, raw: out };
//   } catch (err) {
//     return { error: err.message, nsfwScore: 0 };
//   }
// }

// /** Step 2: Object detection (DETR) */
// async function detectObjects(buffer) {
//   try {
//     const out = await hfPost(DETR_MODEL, buffer);
//     // out = [{score:0.98,label:"person",box:{xmin,..}}, ...]
//     return { objects: Array.isArray(out) ? out : [], raw: out };
//   } catch (err) {
//     return { error: err.message, objects: [] };
//   }
// }

// /** Step 3: Caption fallback (BLIP) */
// async function captionImage(buffer) {
//   try {
//     const out = await hfPost(CAPTION_MODEL, buffer);
//     // out = [{'generated_text': 'a photo of a ...'}]
//     let caption = "";
//     if (Array.isArray(out) && out[0]?.generated_text) {
//       caption = out[0].generated_text;
//     }
//     return { caption, raw: out };
//   } catch (err) {
//     return { error: err.message, caption: "" };
//   }
// }

// /** Utility: estimate person dominance */
// function personDominance(objs, imageW=1, imageH=1) {
//   // DETR boxes are absolute pixels if model returns them that way;
//   // some HF models return normalized; we defensively clamp 0-1
//   // Try to auto-detect scale: if any box >1e3 assume pixel dims unknown; skip dominance
//   let big = objs.find(o => o.box && (o.box.width > 1 || o.box.height > 1));
//   // We can't know image dims from HF result; fallback: relative area by (w*h) vs max box
//   // So we approximate: area ratio = box.area / maxBox.area
//   if (!objs.length) return 0;
//   const areas = objs.map(o => (o.box?.width || 0) * (o.box?.height || 0));
//   const maxArea = Math.max(...areas, 1);
//   const personAreas = objs
//     .filter(o => o.label === "person")
//     .map(o => (o.box?.width || 0) * (o.box?.height || 0));
//   const personMax = Math.max(...personAreas, 0);
//   // person coverage relative to biggest box (not to full image—not available)
//   return personMax / maxArea;
// }

// /** Decide product from detected objects */
// function isProductFromObjects(objs, scoreThresh=0.35) {
//   for (const o of objs) {
//     if (!o?.label) continue;
//     if ((o.score ?? 0) < scoreThresh) continue;
//     const lab = o.label.toLowerCase();
//     if (PRODUCT_OBJECTS.has(lab)) return true;
//     // loose match: some labels come with synonyms "cell phone" vs "mobile phone"
//     if (lab.includes("phone") || lab.includes("laptop") || lab.includes("keyboard") ||
//     lab.includes("mouse") || lab.includes("remote") || lab.includes("tv") ||
//     lab.includes("monitor") || lab.includes("bottle") || lab.includes("backpack") ||
//     lab.includes("bag") || lab.includes("suitcase") || lab.includes("chair") ||
//     lab.includes("sofa") || lab.includes("couch") || lab.includes("shoe") ||
//     lab.includes("sneaker") || lab.includes("boot") || lab.includes("sandals") ||
//     lab.includes("book") || lab.includes("clock") || lab.includes("vase")) {
//   return true;
// }

//   }
//   return false;
// }

// /** Decide product from caption (fallback) */
// function isProductFromCaption(caption) {
//   if (!caption) return false;
//   const c = caption.toLowerCase();
//   const kw = [
//     "product","phone","mobile","device","laptop","computer","keyboard","mouse",
//     "headphones","earbuds","bottle","bag","backpack","watch","shoe","sneaker",
//     "chair","sofa","couch","table","camera","gadget","tool","equipment","appliance"
//   ];
//   return kw.some(k => c.includes(k));
// }

// /**
//  * High-level strict validator
//  * Returns {isProduct, rejectReason?, scores:{...}, debug:{...}}
//  */
// async function validateProductImage(buffer) {
//   // Parallel calls
//   const [nsfwRes, detRes, capRes] = await Promise.all([
//     detectNsfw(buffer),
//     detectObjects(buffer),
//     captionImage(buffer)
//   ]);

//   // Check NSFW first
//   if (nsfwRes.error) {
//     return { isProduct: false, rejectReason: "NSFW check failed", debug: { nsfwRes } };
//   }
//   if (nsfwRes.nsfwScore > 0.4) {
//     return { isProduct: false, rejectReason: "NSFW image", debug: { nsfwRes } };
//   }

//   // Object detection decision
//   const objs = detRes.objects || [];
//   const productObj = isProductFromObjects(objs, 0.35);
//   const personDom = personDominance(objs); // 0-1 approx based on box area
//   const personDetected = objs.some(o => o.label === "person" && (o.score ?? 0) > 0.5);

//   // If a person dominates & no product object, reject
//   if (personDetected && !productObj && personDom > 0.35) {
//     return { isProduct: false, rejectReason: "Person/selfie, no product", debug: { detRes, personDom } };
//   }

//   if (productObj) {
//     return {
//       isProduct: true,
//       rejectReason: null,
//       debug: { nsfwRes, detRes, capRes }
//     };
//   }

//   // Fallback: try caption
//   const capProduct = isProductFromCaption(capRes.caption);
//   if (capProduct) {
//     return {
//       isProduct: true,
//       rejectReason: null,
//       debug: { nsfwRes, detRes, capRes }
//     };
//   }

//   // Final reject
//   return {
//     isProduct: false,
//     rejectReason: "No product object detected",
//     debug: { nsfwRes, detRes, capRes }
//   };
// }

// module.exports = { validateProductImage };


// //kdmkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk

// // strong-product-image-validator.js
// // ------------------------------------------------------------
// // FREE, LOCAL (no paid API) product-image validator for marketplace uploads.
// // Uses @xenova/transformers (ONNX/WebGPU/WebAssembly) models that auto-download
// // from Hugging Face the first time and then cache locally.
// //
// // Strategy (multi-signal, strict):
// //   1. Object detection (facebook/detr-resnet-50) -> detect COCO objects.
// //   2. Image classification (microsoft/beit-base-patch16-224) -> global label.
// //   3. Image caption (Salesforce/blip-image-captioning-base) -> semantic text.
// //   4. Keyword + synonym match against a LARGE Amazon-style product taxonomy.
// //   5. Optional NSFW heuristic via caption keywords (no heavy NSFW model; stays free).
// //
// // Result: { isProduct, matchedCategories:[...], scores:{...}, reasons:[...], debug:{} }
// //
// // NOTE: This is stricter than earlier versions. Tweak THRESHOLDS below.
// // ------------------------------------------------------------

// const { pipeline } = require("@xenova/transformers");
// const fs=require('fs')
// const path=require('path')

// /* ------------------------------------------------------------
//  * THRESHOLDS & SETTINGS
//  * ----------------------------------------------------------*/
//  const SETTINGS = {
//   DETR_SCORE_MIN: 0.35,       // min box confidence to consider
//   DETR_PERSON_REJECT_DOM: 0.45, // if person boxes dominate & no product -> reject
//   CLS_TOPK: 5,                // how many top classification labels to scan
//   CAPTION_REQUIRED: false,    // if true require caption product keyword when DETR inconclusive
//   CAPTION_PRODUCT_WEIGHT: 0.25,// weight contributed by caption match
//   REQUIRE_ANY_SIGNAL: true,   // must match at least 1 signal (detr/cls/caption)
//   REQUIRE_NON_PEOPLE_OBJECT: true, // reject pure-people images
//   NSFW_WORD_BLOCK: ["nude","naked","lingerie","underwear","bikini","nsfw","adult"],
//   NSFW_CAPTION_BLOCK_STRICT: false,// set true to block if any NSFW word in caption
// };

// /* ------------------------------------------------------------
//  * AMAZON-LIKE PRODUCT TAXONOMY KEYWORDS
//  * Each category: canonical + synonyms + regex fragments.
//  * IMPORTANT: keep lowercase!
//  * ----------------------------------------------------------*/

// // Helper to quickly create category record
// function cat(name, kws, opts={}) {return {name, kws: Array.from(new Set(kws.map(k=>k.toLowerCase()))), ...opts};}

// const PRODUCT_CATEGORIES = [
//   // ELECTRONICS ------------------------------------------------
//   cat('mobile_phone', ["phone","cell phone","mobile","smartphone","iphone","android","handset","mobile phone","cellphone","cell-phone","mobile-device"]),
//   cat('tablet', ["tablet","ipad","android tablet","tab"]),
//   cat('laptop', ["laptop","notebook","macbook","chromebook","gaming laptop","ultrabook"]),
//   cat('desktop_pc', ["desktop","pc tower","gaming pc","all in one","computer"]),
//   cat('monitor', ["monitor","computer monitor","display","pc screen","desktop screen","lcd","led monitor"]),
//   cat('tv', ["tv","television","smart tv","oled tv","led tv","uhd tv","4k tv"]),
//   cat('camera', ["camera","dslr","mirrorless","point and shoot","action camera","gopro"], {boost:0.1}),
//   cat('headphones', ["headphone","headphones","headset","gaming headset","over ear","on ear"], {boost:0.05}),
//   cat('earbuds', ["earbud","earbuds","airpods","in ear","true wireless","twse"], {boost:0.05}),
//   cat('smartwatch', ["smartwatch","watch","fitness band","fitness tracker","wearable"]),
//   cat('speaker', ["speaker","bluetooth speaker","smart speaker","soundbar","sound bar","portable speaker"]),
//   cat('keyboard', ["keyboard","gaming keyboard","mechanical keyboard"]),
//   cat('mouse', ["mouse","gaming mouse","wireless mouse"]),
//   cat('printer', ["printer","inkjet","laser printer","all in one printer"], {boost:0.05}),
//   cat('router', ["router","wifi router","wireless router","modem router"]),
//   cat('storage', ["hard drive","ssd","external drive","hdd","usb drive","flash drive","memory card"]),
//   cat('console', ["playstation","ps5","xbox","nintendo","gaming console","switch"]),
//   cat('drone', ["drone","quad copter","quadcopter","uav"]),

//   // FASHION / APPAREL -----------------------------------------
//   cat('shirt_top', ["shirt","t shirt","t-shirt","tee","top","blouse","kurta","sweatshirt","hoodie"]),
//   cat('pants_bottom', ["pants","jeans","trousers","bottom","track pant","joggers","leggings"]),
//   cat('shorts', ["short","shorts","cargo shorts","denim shorts"]),
//   cat('dress', ["dress","gown","frock","maxi dress","mini dress","lehenga"]),
//   cat('skirt', ["skirt","long skirt","mini skirt"], {boost:0.05}),
//   cat('jacket_coat', ["jacket","coat","blazer","sweater","cardigan","windcheater","raincoat"]),
//   cat('saree', ["saree","sari"], {boost:0.1}),
//   cat('salwar_suit', ["salwar","salwar suit","anarkali","punjabi suit"]),
//   cat('kid_wear', ["kids wear","baby dress","infant clothing","romper"]),

//   // FOOTWEAR --------------------------------------------------
//   cat('shoe', ["shoe","shoes","sneaker","sneakers","running shoe","sports shoe","formal shoe","casual shoe","boot","boots","ankle boot","high heel","heel","sandals","sandal","flip flop","flip-flop","slipper","slippers","loafer","loafers","crocs"]),

//   // ACCESSORIES ------------------------------------------------
//   cat('bag', ["bag","bags","backpack","rucksack","handbag","purse","tote","sling bag","laptop bag","school bag"]),
//   cat('wallet', ["wallet","card holder","money clip"], {boost:0.05}),
//   cat('belt', ["belt","leather belt","waist belt"]),
//   cat('cap_hat', ["cap","hat","baseball cap","beanie","wool cap"], {boost:0.05}),
//   cat('sunglasses', ["sunglasses","sunglass","goggles","shades"], {boost:0.05}),
//   cat('jewelry', ["jewelry","jewellery","necklace","earring","earrings","ring","bracelet","bangle","nose ring","mangalsutra","chain"]),

//   // HOME ------------------------------------------------------
//   cat('furniture', ["chair","sofa","couch","table","dining table","bed","mattress","wardrobe","cabinet","desk","stool","bench","bookshelf"]),
//   cat('decor', ["vase","wall art","painting","photo frame","showpiece","statue","figurine","decor item","lamp","table lamp","floor lamp"]),
//   cat('kitchen', ["cookware","pan","pot","pressure cooker","gas stove","induction cooktop","mixer","blender","grinder","kettle","toaster","microwave","oven","fridge","refrigerator","utensil","knife set"]),
//   cat('cleaning', ["vacuum","vacuum cleaner","mop","broom","cleaning brush"]),

//   // BEAUTY & PERSONAL CARE ------------------------------------
//   cat('beauty', ["lipstick","makeup","foundation","compact","eyeliner","mascara","cosmetic","beauty kit"]),
//   cat('personal_care', ["shampoo","soap","body wash","face wash","lotion","cream","toothbrush","toothpaste","razor","trimmer","hair dryer"]),

//   // SPORTS & OUTDOORS -----------------------------------------
//   cat('sports_gear', ["cricket bat","ball","football","soccer ball","basketball","tennis racket","badminton racket","shuttlecock","yoga mat","dumbbell","fitness band","helmet","skateboard","cycle","bicycle","bike helmet"]),

//   // TOYS ------------------------------------------------------
//   cat('toy', ["toy","toys","lego","action figure","doll","remote car","rc car","puzzle","board game"]),

//   // AUTOMOTIVE ------------------------------------------------
//   cat('auto', ["car accessory","bike accessory","helmet","seat cover","car mat","wiper","tyre","tire","engine oil","motorcycle jacket"]),
// ];

// // Flatten keyword map for fast lookup
// const KW_TO_CATEGORY = new Map();
// for (const c of PRODUCT_CATEGORIES) {
//   for (const kw of c.kws) {
//     if (!KW_TO_CATEGORY.has(kw)) KW_TO_CATEGORY.set(kw, []);
//     KW_TO_CATEGORY.get(kw).push(c.name);
//   }
// }

// /* ------------------------------------------------------------
//  * TEXT NORMALIZATION UTILS
//  * ----------------------------------------------------------*/
// function norm(str='') {
//   return str.toLowerCase().replace(/[^a-z0-9+\s-]/g, ' ').replace(/\s+/g,' ').trim();
// }

// function tokenize(str='') {
//   return norm(str).split(' ').filter(Boolean);
// }

// /** fuzzy contains: does text contain kw tokens in order? */
// function fuzzyContains(text, kw) {
//   const t = norm(text);
//   const k = norm(kw);
//   return t.includes(k);
// }

// /** match categories from any text snippet */
// export function matchCategoriesFromText(text='') {
//   const hits = new Set();
//   const t = norm(text);
//   for (const [kw, cats] of KW_TO_CATEGORY.entries()) {
//     if (t.includes(kw)) {
//       cats.forEach(c=>hits.add(c));
//     }
//   }
//   return Array.from(hits);
// }

// /* ------------------------------------------------------------
//  * MODEL LOADERS (lazy, shared singletons)
//  * ----------------------------------------------------------*/
// let detrPipeline = null;
// let clsPipeline = null;
// let capPipeline = null;

// async function getDetr() {
//   if (!detrPipeline) {
//     detrPipeline = await pipeline('object-detection', 'facebook/detr-resnet-50');
//   }
//   return detrPipeline;
// }

// async function getCls() {
//   if (!clsPipeline) {
//     clsPipeline = await pipeline('image-classification', 'microsoft/beit-base-patch16-224');
//   }
//   return clsPipeline;
// }

// async function getCap() {
//   if (!capPipeline) {
//     capPipeline = await pipeline('image-to-text', 'Salesforce/blip-image-captioning-base');
//   }
//   return capPipeline;
// }

// /* ------------------------------------------------------------
//  * CORE VALIDATION
//  * ----------------------------------------------------------*/

// /**
//  * Validate product image from a Node Buffer (multer memoryStorage).
//  * @param {Buffer} buffer
//  * @param {Object} opts override SETTINGS
//  */
// export async function validateProductImage(buffer, opts={}) {
//   const cfg = {...SETTINGS, ...opts};
//   const reasons = [];
//   const scores = {
//     detrProduct: 0,
//     clsProduct: 0,
//     captionProduct: 0,
//     personDom: 0,
//   };

//   // write buffer to temp file path because @xenova pipelines accept path/URL/TypedArray
//   const tmp = await bufferToTmp(buffer, 'upload');

//   /* 1. DETR object detection */
//   let detObjects = [];
//   try {
//     const detr = await getDetr();
//     detObjects = await detr(tmp); // array of {score,label,box}
//   } catch (err) {
//     reasons.push(`detr_error:${err.message}`);
//   }

//   // compute person dominance & product object presence
//   let hasProductObj = false;
//   let personBoxes = [];
//   let maxArea = 0; // we don't know image dims; approximate from boxes
//   for (const o of detObjects) {
//     const box = o.box || {}; // {xmin,xmax,ymin,ymax}
//     const w = Math.max(0, (box.xmax ?? 0) - (box.xmin ?? 0));
//     const h = Math.max(0, (box.ymax ?? 0) - (box.ymin ?? 0));
//     const area = w*h;
//     if (area > maxArea) maxArea = area;

//     const lab = (o.label||'').toLowerCase();
//     const sc = o.score ?? 0;
//     if (sc >= cfg.DETR_SCORE_MIN) {
//       if (lab === 'person') personBoxes.push({area,score:sc});
//       if (isAllowedProductLabel(lab)) {
//         hasProductObj = true;
//         scores.detrProduct = Math.max(scores.detrProduct, sc);
//       }
//     }
//   }

//   let personDom = 0;
//   if (personBoxes.length && maxArea>0) {
//     const topPersonArea = Math.max(...personBoxes.map(p=>p.area));
//     personDom = topPersonArea / maxArea; // relative to largest box seen
//     scores.personDom = personDom;
//   }

//   if (cfg.REQUIRE_NON_PEOPLE_OBJECT && !hasProductObj && personDom > cfg.DETR_PERSON_REJECT_DOM) {
//     reasons.push('person_dominates_no_product');
//   }

//   /* 2. Image Classification */
//   let clsLabel = '';
//   try {
//     const cls = await getCls();
//     const clsRes = await cls(tmp, {topk: cfg.CLS_TOPK});
//     // clsRes: array sorted
//     for (const r of clsRes) {
//       const lab = r.label?.toLowerCase() || '';
//       if (!clsLabel) clsLabel = lab;
//       if (isAllowedProductLabel(lab)) {
//         hasProductObj = true;
//         scores.clsProduct = Math.max(scores.clsProduct, r.score ?? 0);
//       }
//     }
//   } catch (err) {
//     reasons.push(`cls_error:${err.message}`);
//   }

//   /* 3. Caption (semantic) */
//   let caption = '';
//   try {
//     const cap = await getCap();
//     const out = await cap(tmp);
//     // output: [{generated_text:"a photo of ..."}] or string
//     if (Array.isArray(out) && out[0]?.generated_text) caption = out[0].generated_text;
//     else if (typeof out === 'string') caption = out;

//     const catsFromCap = matchCategoriesFromText(caption);
//     if (catsFromCap.length) {
//       hasProductObj = true; // semantic fallback
//       scores.captionProduct = cfg.CAPTION_PRODUCT_WEIGHT; // credited weight
//     }

//     // Optional NSFW word block
//     if (cfg.NSFW_CAPTION_BLOCK_STRICT) {
//       const capLow = caption.toLowerCase();
//       if (cfg.NSFW_WORD_BLOCK.some(w=>capLow.includes(w))) {
//         reasons.push('nsfw_caption');
//       }
//     }
//   } catch (err) {
//     reasons.push(`caption_error:${err.message}`);
//   }

//   /* 4. Decide matched categories from all signals */
//   const categories = new Set();

//   // from DETR labels
//   detObjects.forEach(o=>{
//     const lab = (o.label||'').toLowerCase();
//     if (isAllowedProductLabel(lab)) {
//       mergeCategoriesForLabel(lab, categories);
//     }
//   });

//   // from classification top label
//   if (clsLabel) mergeCategoriesForLabel(clsLabel, categories);

//   // from caption
//   const capCats = matchCategoriesFromText(caption);
//   capCats.forEach(c=>categories.add(c));

//   /* 5. Final decision */
//   let isProduct = hasProductObj;
//   if (cfg.REQUIRE_ANY_SIGNAL && !hasProductObj) {
//     isProduct = false;
//     reasons.push('no_product_signal');
//   }

//   // if NSFW reason flagged above -> force reject
//   if (reasons.includes('nsfw_caption')) {
//     isProduct = false;
//   }

//   // cleanup temp file
//   try { await fs.promises.unlink(tmp); } catch {}

//   return {
//     isProduct,
//     matchedCategories: Array.from(categories),
//     scores,
//     caption,
//     detCount: detObjects.length,
//     reasons,
//     detObjects: detObjects.slice(0,20), // debug trim
//     clsLabel,
//   };
// }

// /* ------------------------------------------------------------
//  * SUPPORT FNS
//  * ----------------------------------------------------------*/

// function isAllowedProductLabel(label) {
//   const lab = label.toLowerCase();
//   // direct keyword hit from taxonomy
//   for (const [kw] of KW_TO_CATEGORY.entries()) {
//     if (lab.includes(kw)) return true;
//   }
//   // some COCO -> taxonomy bridging
//   if (lab === 'cell phone') return true;
//   if (lab === 'handbag') return true;
//   if (lab === 'backpack') return true;
//   if (lab === 'tv') return true;
//   if (lab === 'laptop') return true;
//   if (lab === 'keyboard') return true;
//   if (lab === 'mouse') return true;
//   if (lab === 'remote') return true;
//   if (lab === 'book') return true;
//   if (lab === 'vase') return true;
//   if (lab === 'cup') return true;
//   if (lab === 'bottle') return true;
//   if (lab === 'chair') return true;
//   if (lab === 'couch') return true;
//   if (lab === 'bed') return true;
//   if (lab === 'suitcase') return true;
//   if (lab === 'skateboard') return true;
//   if (lab === 'surfboard') return true;
//   if (lab === 'tennis racket') return true;
//   // footwear bridging
//   if (lab.includes('sneaker') || lab.includes('shoe') || lab.includes('boot') || lab.includes('sandal') || lab.includes('slipper')) return true;
//   return false;
// }

// function mergeCategoriesForLabel(label, setOut) {
//   const lab = label.toLowerCase();
//   // direct kw match
//   for (const [kw, cats] of KW_TO_CATEGORY.entries()) {
//     if (lab.includes(kw)) cats.forEach(c=>setOut.add(c));
//   }
//   // fallback heuristics for common DETR labels -> categories
//   if (lab === 'cell phone') setOut.add('mobile_phone');
//   if (lab === 'handbag') setOut.add('bag');
//   if (lab === 'backpack') setOut.add('bag');
//   if (lab === 'tv') setOut.add('tv');
//   if (lab === 'laptop') setOut.add('laptop');
//   if (lab === 'keyboard') setOut.add('keyboard');
//   if (lab === 'mouse') setOut.add('mouse');
//   if (lab === 'remote') setOut.add('speaker');
//   if (lab === 'book') setOut.add('book');
//   if (lab === 'vase') setOut.add('decor');
//   if (lab === 'cup') setOut.add('kitchen');
//   if (lab === 'bottle') setOut.add('kitchen');
//   if (lab === 'chair') setOut.add('furniture');
//   if (lab === 'couch') setOut.add('furniture');
//   if (lab === 'bed') setOut.add('furniture');
//   if (lab === 'suitcase') setOut.add('bag');
//   if (lab.includes('sneaker') || lab.includes('shoe') || lab.includes('boot') || lab.includes('sandal') || lab.includes('slipper')) setOut.add('shoe');
// }

// /** write Buffer -> tmp path */
// async function bufferToTmp(buffer, prefix='img') {
//   const dir = process.env.TMP_DIR || './tmp_uploads';
//   await fs.promises.mkdir(dir, { recursive: true });
//   const file = path.join(dir, `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}.bin`);
//   await fs.promises.writeFile(file, buffer);
//   return file;
// }

// /* ------------------------------------------------------------
//  * QUICK SELF TEST (node strong-product-image-validator.js ./shoe.jpg)
//  * ----------------------------------------------------------*/
// if (import.meta.url === `file://${process.argv[1]}`) {
//   const img = process.argv[2];
//   if (!img) {
//     console.error('Usage: node strong-product-image-validator.js <imagePath>');
//     process.exit(1);
//   }
//   const buf = await fs.promises.readFile(img);
//   const res = await validateProductImage(buf);
//   console.log(JSON.stringify(res,null,2));
// }
// module.exports = { SETTINGS, classifyImage };