import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';


const _container = {
  display: 'flex',
  margin: 'auto',
  flexWrap: 'wrap',
  alignItems: 'center',
  flexGrow: 1
}
const _videos_container = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
  width: '100%',
  height: 'fit-content'
}
const _video_wrapper = {
  width: '100%',
  maxWidth: '450px'
}
const _video_container = {
  position: 'relative',
  width: '100%',
  paddingTop: '75%',
  borderRadius: '5px',
  flexGrow: '1',
  boxSizing: 'border-box'
}

let _btn = {
  padding: '10px 30px',
  height: '40px',
  backgroundColor: '#49A878',
  margin: '20px',
  color: 'white'
}
let _video = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  objectFit: 'contain',
}

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on('stream', stream => {
      ref.current.srcObject = stream;
    })
  }, []);

  return (
    <video style={_video} playsInline autoPlay ref={ref} />
  );
}

const Room = (props) => {
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState();
  const [videoTrack, setVideoTrack] = useState();
  const [videoTrack2, setVideoTrack2] = useState();
  const [audioTrack, setAudioTrack] = useState();
  const [audioTrack2, setAudioTrack2] = useState();
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = props.match.params.roomID;

  useEffect(() => {
    socketRef.current = io.connect('/');
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      setVideoTrack(stream.getVideoTracks());
      setAudioTrack(stream.getAudioTracks());
      const { width, height } = stream.getTracks()[1].getSettings();
      userVideo.current.srcObject = stream;
      socketRef.current.emit('join room', roomID);
      socketRef.current.on('room full', () => {
        alert('sorry the room is full, create new one!!!')
      });
      socketRef.current.on('user disconnected', (userID) => {
        peersRef.current.find(peer => peer.peerID === userID).peer.destroy();
        const newPeers = peersRef.current.filter(peer => peer.peerID !== userID);
        peersRef.current = [...newPeers];
        setPeers([...newPeers]);
      });
      socketRef.current.on('all users', users => {
        const newPeers = [];
        users.forEach(userID => {
          const peer = createPeer(userID, socketRef.current.id, stream);
          peersRef.current.push({
            peerID: userID,
            peer,
          })
          newPeers.push({peer, peerID: userID});
        })
        setPeers(newPeers);
      
      })

      socketRef.current.on('user joined', payload => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        const exist = peersRef.current.find(p => p.peerID === payload.callerID);
        if (exist) {
          peersRef.current.find(p => p.peerID === payload.callerID).peer = peer;
          setPeers([...peersRef.current]);
        } else {
          peersRef.current.push({
          peerID: payload.callerID,
          peer,
        })
        setPeers(prev => [...prev, {peer, peerID: payload.callerID}]);
        }
      });

      socketRef.current.on('receiving returned signal', payload => {
        const item = peersRef.current.find(p => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      });
    })
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });
    peer.on('signal', signal => {
      socketRef.current.emit('sending signal', { userToSignal, callerID, signal })
    })
    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    })
    peer.on('signal', signal => {
      socketRef.current.emit('returning signal', { signal, callerID })
    })
    peer.signal(incomingSignal);
    return peer;
  }

  const turnonoffvideo = () => {
    if (stream.getVideoTracks()[0]) {
      stream.removeTrack(videoTrack[0]);
      const t = videoTrack[0].clone();
      t.enabled = false;
      setVideoTrack2(t)
      peers.forEach((peer) => peer.peer.replaceTrack(videoTrack[0], t, stream))
    } else {
      stream.addTrack(videoTrack[0]);
      peers.forEach((peer) => peer.peer.replaceTrack(videoTrack2, videoTrack[0],  stream))
    }
    
  }
  const turnonoffaudio = () => {
    if (stream.getAudioTracks()[0]) {
      stream.removeTrack(audioTrack[0]);
      const t = audioTrack[0].clone();
      t.enabled = false;
      setAudioTrack2(t)
      peers.forEach((peer) => peer.peer.replaceTrack(audioTrack[0], t, stream))
    } else {
      stream.addTrack(audioTrack[0]);
      peers.forEach((peer) => peer.peer.replaceTrack(audioTrack2, audioTrack[0],  stream))
    }
    
  }

  return (
    <div style={_container}>
      <div style={_videos_container}>
        <div style={_video_wrapper}>
          <div style={_video_container}>
            <video style={_video} muted ref={userVideo} autoPlay playsInline />
          </div>
        </div>
        {peers.map((peer, index) => {
          return (
            <div key={index}  style={_video_wrapper}>
              <div style={_video_container}>
                <Video peer={peer.peer} />
              </div>
            </div>
          );
        })} 
      </div>
      {/* <button style={_btn} onClick={turnonoffvideo}>on off Video</button>
      <button style={_btn} onClick={turnonoffaudio}>on off Audio</button> */}
    </div>
  );
};

export default Room;