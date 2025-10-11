// Debug logging utility for development
const DEBUG_ENABLED = process.env.NODE_ENV === 'development';

export class DebugLogger {
  private static instance: DebugLogger;
  
  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  // Button click logging
  logButtonClick(buttonName: string, data?: any) {
    if (!DEBUG_ENABLED) return;
    
    console.group(`🔘 Button Click: ${buttonName}`);
    console.log('⏰ Time:', new Date().toLocaleTimeString());
    if (data) {
      console.log('📊 Data:', data);
    }
    console.log('📍 Stack trace:');
    console.trace();
    console.groupEnd();
  }

  // API call logging
  logApiCall(method: string, endpoint: string, data?: any) {
    if (!DEBUG_ENABLED) return;
    
    console.group(`🌐 API Call: ${method} ${endpoint}`);
    console.log('⏰ Time:', new Date().toLocaleTimeString());
    if (data) {
      console.log('📤 Request Data:', data);
    }
    console.groupEnd();
  }

  // API response logging
  logApiResponse(method: string, endpoint: string, response?: any, error?: any) {
    if (!DEBUG_ENABLED) return;
    
    if (error) {
      console.group(`❌ API Error: ${method} ${endpoint}`);
      console.log('⏰ Time:', new Date().toLocaleTimeString());
      console.log('🚨 Error:', error);
      console.groupEnd();
    } else {
      console.group(`✅ API Success: ${method} ${endpoint}`);
      console.log('⏰ Time:', new Date().toLocaleTimeString());
      if (response) {
        console.log('📥 Response:', response);
      }
      console.groupEnd();
    }
  }

  // Component state changes
  logStateChange(component: string, stateName: string, oldValue: any, newValue: any) {
    if (!DEBUG_ENABLED) return;
    
    console.group(`🔄 State Change: ${component}.${stateName}`);
    console.log('⏰ Time:', new Date().toLocaleTimeString());
    console.log('📉 Old Value:', oldValue);
    console.log('📈 New Value:', newValue);
    console.groupEnd();
  }

  // User interactions
  logUserInteraction(action: string, target: string, data?: any) {
    if (!DEBUG_ENABLED) return;
    
    console.group(`👆 User Interaction: ${action} on ${target}`);
    console.log('⏰ Time:', new Date().toLocaleTimeString());
    if (data) {
      console.log('📊 Data:', data);
    }
    console.groupEnd();
  }

  // Long press events
  logLongPress(target: string, duration: number) {
    if (!DEBUG_ENABLED) return;
    
    console.group(`⏳ Long Press: ${target}`);
    console.log('⏰ Time:', new Date().toLocaleTimeString());
    console.log('⏱️ Duration:', `${duration}ms`);
    console.groupEnd();
  }

  // Form submissions
  logFormSubmit(formName: string, data: any) {
    if (!DEBUG_ENABLED) return;
    
    console.group(`📝 Form Submit: ${formName}`);
    console.log('⏰ Time:', new Date().toLocaleTimeString());
    console.log('📊 Form Data:', data);
    console.groupEnd();
  }

  // Navigation events
  logNavigation(from: string, to: string) {
    if (!DEBUG_ENABLED) return;
    
    console.group(`🧭 Navigation: ${from} → ${to}`);
    console.log('⏰ Time:', new Date().toLocaleTimeString());
    console.groupEnd();
  }

  // General debug messages
  log(category: string, message: string, data?: any) {
    if (!DEBUG_ENABLED) return;
    
    console.group(`🐛 Debug: ${category}`);
    console.log('⏰ Time:', new Date().toLocaleTimeString());
    console.log('💬 Message:', message);
    if (data) {
      console.log('📊 Data:', data);
    }
    console.groupEnd();
  }
}

// Export singleton instance
export const debugLogger = DebugLogger.getInstance();
