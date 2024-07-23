import natural from 'natural';
import fs from 'fs';
import stringSimilarity from 'string-similarity';

const { WordTokenizer, TfIdf, PorterStemmer } = natural;

const tokenizer = new WordTokenizer();
let tfidfModel;
let cachedData = null;

function removeStopwords(tokens) {
  return tokens.filter(token => !natural.stopwords.includes(token));
}

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

function vectorizeText(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase()).map(token => PorterStemmer.stem(token));
  const filteredTokens = removeStopwords(tokens);
  const vector = new Array(tfidfModel.documents.length).fill(0);
  filteredTokens.forEach(token => {
    tfidfModel.tfidfs(token, (i, measure) => {
      vector[i] += measure;
    });
  });
  return vector;
}

function preprocessText(text) {
  // Remove non-printable characters and special characters
  let cleanedText = text.replace(/[^\x20-\x7E]/g, '').replace(/[^a-zA-Z0-9.,?!'\s]/g, '');
  // Convert to lowercase
  cleanedText = cleanedText.toLowerCase();
  // Expand contractions
  const contractionMap = {
    "won't": "will not",
    "can't": "cannot",
    "i'm": "i am",
    "it's": "it is",
    // Add more contractions as needed
  };
  Object.keys(contractionMap).forEach(contraction => {
    cleanedText = cleanedText.replace(new RegExp('\\b' + contraction + '\\b', 'gi'), contractionMap[contraction]);
  });
  return cleanedText;
}

function buildTfidfModel(sentences) {
  if (!tfidfModel) {
    tfidfModel = new TfIdf();
    sentences.forEach(sentence => {
      const tokens = tokenizer.tokenize(sentence.toLowerCase()).map(token => PorterStemmer.stem(token));
      const filteredTokens = removeStopwords(tokens);
      tfidfModel.addDocument(filteredTokens.join(' '));
    });
  }
  return tfidfModel;
}

function getCachedData() {
  if (!cachedData) {
    try {
      const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
      const preprocessedText = preprocessText(data.text);
      const sentences = preprocessedText.split(/[.!?]/g).filter(sentence => sentence.trim().length > 0);
      cachedData = { data, preprocessedText, sentences };
      buildTfidfModel(sentences);
    } catch (error) {
      console.error('Error reading or parsing data.json:', error);
      throw new Error('Failed to initialize cached data');
    }
  }
  return cachedData;
}

function getContextAwareAnswer(sentences, bestAnswerIndex, contextSize = 1) {
  const start = Math.max(0, bestAnswerIndex - contextSize);
  const end = Math.min(sentences.length - 1, bestAnswerIndex + contextSize);
  return sentences.slice(start, end + 1).join(' ');
}

function getTopAnswers(scores, n = 3) {
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(score => score.sentence);
}

export async function findBestAnswer(question) {
  try {
    const { data, preprocessedText, sentences } = getCachedData();

    // Predefined questions and answers
    const predefinedQuestions = [
      {
        question: "What is the title of the PDF?",
        answer: data.info.Title
      },
      {
        question: "How many pages are in the PDF?",
        answer: `The PDF has ${data.numpages} pages.`
      },
      // Add more predefined questions and answers as needed
    ];

    // Check if the question matches any predefined questions using fuzzy matching
    const predefinedAnswer = predefinedQuestions.find(qa => 
      stringSimilarity.compareTwoStrings(qa.question.toLowerCase(), question.toLowerCase()) > 0.8
    );
    if (predefinedAnswer) {
      return { success: true, answer: predefinedAnswer.answer };
    }

    const questionVector = vectorizeText(preprocessText(question));

    const scores = sentences.map((sentence, index) => {
      const sentenceVector = vectorizeText(sentence.trim());
      const similarity = cosineSimilarity(questionVector, sentenceVector);
      return { sentence, score: similarity, index };
    }).filter(scoreObj => !isNaN(scoreObj.score) && scoreObj.score > 0);

    const bestAnswer = scores.reduce(
      (max, current) => (current.score > max.score ? current : max),
      { score: 0 }
    );

    if (bestAnswer.score > 0.2) {
      const contextAwareAnswer = getContextAwareAnswer(sentences, bestAnswer.index);
      const topAnswers = getTopAnswers(scores);
      
      const formattedAnswer = `Based on your question, here's what I found:

"${contextAwareAnswer}"

This information is extracted from the provided text. Here are also the top 3 relevant sentences:

${topAnswers.map((sentence, index) => `${index + 1}. "${sentence}"`).join('\n')}

If you need more details or have additional questions, please let me know!`;
      
      return { success: true, answer: formattedAnswer };
    } else {
      return {
        success: false,
        answer: "I apologize, but I couldn't find a highly relevant answer to your question in the provided text. Could you please rephrase your question or provide more specific details? I'll do my best to assist you."
      };
    }
  } catch (error) {
    console.error('Error occurred while finding the best answer:', error);
    return {
      success: false,
      answer: "I'm sorry, but an error occurred while processing your question. Please try again later."
    };
  }
}