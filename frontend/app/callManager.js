class CallManager {
    static generateCallId = (callerId, calleeId) => {
      const sortedIds = [callerId, calleeId].sort();
      return `${sortedIds[0]}-${sortedIds[1]}-${Date.now()}`;
    };
  
    static startCall = async (calleeId) => {
      const callId = this.generateCallId(currentUser.id, calleeId);
      
      // Send notification through your backend
      await fetch('/call/initiate', {
        method: 'POST',
        body: JSON.stringify({ callId, calleeId }),
      });
      
      // Join the call
      const call = client.call('default', callId);
      await call.join({ create: true });
      return call;
    };
  }