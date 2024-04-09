import * as Bob from '@bob-plug/core';
import cnchar from 'cnchar';
import 'cnchar-trad';
import hansOrHant from 'traditional-or-simplified';

interface QueryOption {
  to?: Bob.Language;
  from?: Bob.Language;
  cache?: string;
}

var resultCache = new Bob.CacheResult();

/**
 * @description 汉字转拼音
 * @param {string} text 需要翻译的文字内容
 * @param {object} [options={}]
 * @return {object} 一个符合 bob 识别的翻译结果对象
 */
async function _translate(text: string, options: QueryOption = {}): Promise<Bob.TranslateResult> {
  // 解析选项参数，包括源语言、目标语言和缓存策略
  const { from = 'auto', to = 'auto', cache = 'enable' } = options;
  const cacheKey = `${text}${from}${to}`;
  // 根据缓存策略尝试从缓存中获取翻译结果
  if (cache === 'enable') {
    const _cacheData = resultCache.get(cacheKey);
    if (_cacheData) return _cacheData;
  } else {
    resultCache.clear();
  }

  // 初始化翻译结果对象
  const result: Bob.TranslateResult = { from, to, toParagraphs: [] };

  try {
    // 检测文本是否为中文
    const isZh = /\p{Unified_Ideograph}/u.test(text);
    if (isZh) {
      // 将中文转换为拼音
      // const pinyin = cnchar.spell(cnchar.convert.sparkToSimple(text), 'array', 'tone');
      // Bob.api.$log.info(JSON.stringify(pinyin));
      // 将拼音结果添加到翻译结果对象
      // result.toParagraphs = Array.isArray(pinyin) ? [pinyin.join(' ')] : [pinyin];
      // 进行简繁体和火星文的转换
      const str1 = cnchar.convert.simpleToTrad(text); // 简体 => 繁体
      const str3 = cnchar.convert.tradToSimple(text); // 繁体 => 简体
      const str2 = cnchar.convert.simpleToSpark(text); // 简体 => 火星文
      const str4 = cnchar.convert.tradToSpark(text); // 繁体 => 火星文
      // 判断文本是简体还是繁体
      const isZhHant = hansOrHant.isTraditional(text);
      Bob.api.$log.info(`${isZhHant} ${text}`);
      // 将简繁体和火星文转换结果添加到翻译结果对象
      // result.toDict = {
      f//   addtions: [
      //     { name: isZhHant ? '简体' : '繁体', value: isZhHant ? str3 : str1 }
      //   ],
      // };
      result.toParagraphs = [isZhHant ? str3 : str1];
    } else {
      // 如果文本不是中文，则直接返回原文
      result.toParagraphs = [text];
    }
  } catch (error) {
    // 捕获并抛出处理过程中的错误
    throw Bob.util.error('api', '数据解析错误出错', error);
  }

  // 根据缓存策略将翻译结果存入缓存
  if (cache === 'enable') {
    resultCache.set(cacheKey, result);
  }
  return result;
}

export { _translate };
