
import 'dotenv/config'
import { reviewCode } from './src/services/aiService.js'

async function test() {
  console.log('Testing AI Review Service...')
  try {
    const result = await reviewCode({ 
      code: 'function add(a, b) { return a + b; }', 
      language: 'javascript' 
    })
    console.log('SUCCESS!')
    console.log(JSON.stringify(result, null, 2))
  } catch (err) {
    console.error('FAILED!')
    console.error('Error:', err.message)
    if (err.response) {
      console.error('Data:', err.response.data)
      console.error('Status:', err.response.status)
    }
  }
}

test()
