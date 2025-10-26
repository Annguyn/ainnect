import React, { useState, useEffect } from 'react'
import { websocketService } from '../../services/websocketService'
import { useAuth } from '../../hooks/useAuth'
import { MessageType } from '../../types/messaging'
import { cn } from '../../lib/utils'

export const WebSocketTest: React.FC = () => {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const connectWebSocket = async () => {
    try {
      addLog('Attempting to connect to WebSocket...')
      await websocketService.connect({
        onConnected: () => {
          addLog('✅ WebSocket connected successfully')
          setIsConnected(true)
          setConnectionError(null)
        },
        onError: (error) => {
          addLog(`❌ WebSocket error: ${error}`)
          setConnectionError(error.message || 'Connection error')
        },
        onDisconnected: () => {
          addLog('🔌 WebSocket disconnected')
          setIsConnected(false)
        }
      })
    } catch (error: any) {
      addLog(`❌ Failed to connect: ${error.message}`)
      setConnectionError(error.message)
    }
  }

  const disconnectWebSocket = () => {
    websocketService.disconnect()
    setIsConnected(false)
    setConnectionError(null)
    addLog('🔌 WebSocket disconnected manually')
  }

  const testSendMessage = () => {
    if (!isConnected) {
      addLog('❌ Cannot send message - not connected')
      return
    }

    try {
      const testData = {
        conversationId: 1,
        content: testMessage || 'Test message',
        messageType: MessageType.TEXT,
        attachmentUrls: []
      }
      
      addLog(`📤 Sending test message: ${JSON.stringify(testData)}`)
      websocketService.sendMessage(1, testData)
      addLog('✅ Test message sent successfully')
    } catch (error: any) {
      addLog(`❌ Failed to send test message: ${error.message}`)
    }
  }

  const testSubscribe = () => {
    if (!isConnected) {
      addLog('❌ Cannot subscribe - not connected')
      return
    }

    try {
      addLog('📡 Subscribing to conversation 1...')
      websocketService.subscribeToConversation(1, {
        onMessage: (message) => {
          addLog(`📨 Received message: ${JSON.stringify(message)}`)
        },
        onTyping: (typing) => {
          addLog(`⌨️ Received typing: ${JSON.stringify(typing)}`)
        },
        onError: (error) => {
          addLog(`❌ Subscription error: ${error}`)
        }
      })
      addLog('✅ Subscribed to conversation 1')
    } catch (error: any) {
      addLog(`❌ Failed to subscribe: ${error.message}`)
    }
  }

  useEffect(() => {
    addLog('WebSocket Test Component initialized')
    addLog(`User: ${user ? `${user.username} (${user.id})` : 'Not logged in'}`)
  }, [user])

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">WebSocket Connection Test</h2>
      
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="font-medium">
            Status: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {connectionError && (
          <div className="text-red-600 text-sm mb-2">
            Error: {connectionError}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={connectWebSocket}
          disabled={isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect WebSocket
        </button>
        
        <button
          onClick={disconnectWebSocket}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
        >
          Disconnect
        </button>
        
        <button
          onClick={testSubscribe}
          disabled={!isConnected}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
        >
          Test Subscribe
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Test message content"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={testSendMessage}
          disabled={!isConnected}
          className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send Test Message
        </button>
      </div>

      <div className="bg-gray-100 p-3 rounded max-h-64 overflow-y-auto">
        <h3 className="font-medium mb-2">Logs:</h3>
        {logs.map((log, index) => (
          <div key={index} className="text-sm font-mono mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  )
}
