import natural from 'natural';
import fs from "fs";

const { WordTokenizer, TfIdf, PorterStemmer } = natural;

const tokenizer = new WordTokenizer();
const tfidf = new TfIdf();

function removeStopwords(tokens) {
  return tokens.filter(token => !natural.stopwords.includes(token));
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to vectorize text using TF-IDF
function vectorizeText(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase()).map(token => PorterStemmer.stem(token));
  const filteredTokens = removeStopwords(tokens);
  const vector = new Array(tfidf.documents.length).fill(0);
  filteredTokens.forEach(token => {
    tfidf.tfidfs(token, (i, measure) => {
      vector[i] += measure;
    });
  });
  return vector;
}

// Function to preprocess text
function preprocessText(text) {
  // Remove non-printable characters and special characters
  const cleanedText = text.replace(/[^\x20-\x7E]/g, '').replace(/[^a-zA-Z0-9.,?!'\s]/g, '');
  // Convert to lowercase
  const lowercaseText = cleanedText.toLowerCase();
  return lowercaseText;
}

// Function to find the best answer
export async function findBestAnswer(question) {
  try {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
    const preprocessedText = preprocessText(data.text);
    const sentences = preprocessedText.split(/[.!?]/g).filter(sentence => sentence.trim().length > 0);

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

    // Check if the question matches any predefined questions
    const predefinedAnswer = predefinedQuestions.find(qa => qa.question.toLowerCase() === question.toLowerCase());
    if (predefinedAnswer) {
      return { success: true, answer: predefinedAnswer.answer };
    }

    // Initialize TF-IDF model with the sentences
    sentences.forEach(sentence => {
      const tokens = tokenizer.tokenize(sentence.toLowerCase()).map(token => PorterStemmer.stem(token));
      const filteredTokens = removeStopwords(tokens);
      tfidf.addDocument(filteredTokens.join(' '));
    });

    const questionVector = vectorizeText(preprocessText(question));

    const scores = sentences.map(sentence => {
      const sentenceVector = vectorizeText(sentence.trim());
      const similarity = cosineSimilarity(questionVector, sentenceVector);
      return { sentence, score: similarity };
    }).filter(scoreObj => !isNaN(scoreObj.score) && scoreObj.score > 0);

    const bestAnswer = scores.reduce(
      (max, current) => (current.score > max.score ? current : max),
      { score: 0 }
    );

    if (bestAnswer.score > 0.2) {  // Adjusted threshold
      const answerText = bestAnswer.sentence.trim();
      const formattedAnswer = `Based on your question, here's what I found:\n\n"${answerText}"\n\nThis information is extracted from the provided text. If you need more details or have additional questions, please let me know!`;
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