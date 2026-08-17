/*
 * Subspace Reloaded Desktop Wrapper
 * Copyright (c) 2026 AntiAliasing
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { app, BrowserWindow, ipcMain } = require('electron');

app.commandLine.appendSwitch('enable-unsafe-webgpu');

let mainWindow;

ipcMain.on('f11-pressed', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

ipcMain.on('toggle-mute', (event, muted) => {
  if (mainWindow) {
    mainWindow.webContents.setAudioMuted(muted);
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    icon: __dirname + '/SSRL.ico',
    webPreferences: {
      webSecurity: false,
      preload: __dirname + '/preload.js'
    },
    fullscreen: false
  });

  mainWindow.loadURL('https://subspacereloaded.com/');

  // Handle chat window
  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (details.url.includes('subspacereloaded.com')) {
      const chatWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        frame: false,
        icon: __dirname + '/SSRL.ico',
        webPreferences: {
          webSecurity: false,
          preload: __dirname + '/preload.js'
        },
        fullscreen: false,
        resizable: true,
        transparent: true,
        parent: mainWindow
      });
      
      chatWindow.loadURL(details.url);
      
      chatWindow.webContents.on('did-finish-load', () => {
        chatWindow.webContents.executeJavaScript(`
          const closeBtn = document.createElement('div');
          closeBtn.innerHTML = '✕';
          closeBtn.style.cssText = \`
            position: fixed;
            top: 6px;
            right: 6px;
            width: 24px;
            height: 24px;
            background: rgba(200, 50, 50, 0.8);
            color: white;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            cursor: pointer;
            z-index: 999999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            user-select: none;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.2);
          \`;
          closeBtn.onclick = () => {
            window.close();
          };
          document.body.appendChild(closeBtn);

          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              window.close();
            }
          });
        `);
      });
      
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      const container = document.createElement('div');
      container.id = 'drag-container';
      container.style.cssText = \`
        position: fixed;
        top: 12px;
        right: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      \`;
      
      const toggleLabel = document.createElement('span');
      toggleLabel.id = 'toggle-label';
      toggleLabel.textContent = 'Toggle Screen';
      toggleLabel.style.cssText = \`
        color: white;
        font-size: 13px;
        font-family: 'Segoe UI', Arial, sans-serif;
        background: rgba(0,0,0,0.65);
        padding: 6px 14px 6px 12px;
        border-radius: 6px;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,0.12);
        pointer-events: none;
        white-space: nowrap;
        text-shadow: 0 1px 4px rgba(0,0,0,0.5);
        letter-spacing: 0.3px;
      \`;
      
      const toggleButton = document.createElement('div');
      toggleButton.id = 'toggle-button';
      toggleButton.innerHTML = '⛶';
      toggleButton.style.cssText = \`
        width: 32px;
        height: 32px;
        background: rgba(100, 180, 255, 0.85);
        color: white;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        user-select: none;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,0.2);
      \`;

      const moveLabel = document.createElement('span');
      moveLabel.id = 'drag-label';
      moveLabel.textContent = 'Move Screen';
      moveLabel.style.cssText = \`
        color: white;
        font-size: 13px;
        font-family: 'Segoe UI', Arial, sans-serif;
        background: rgba(0,0,0,0.65);
        padding: 6px 14px 6px 12px;
        border-radius: 6px;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,0.12);
        pointer-events: none;
        white-space: nowrap;
        text-shadow: 0 1px 4px rgba(0,0,0,0.5);
        letter-spacing: 0.3px;
      \`;
      
      const dragButton = document.createElement('div');
      dragButton.id = 'drag-button';
      dragButton.innerHTML = '⣿';
      dragButton.style.cssText = \`
        width: 32px;
        height: 32px;
        background: rgba(100, 180, 255, 0.85);
        color: white;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: move;
        pointer-events: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s ease;
        user-select: none;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,0.2);
        -webkit-app-region: drag;
      \`;
      
      // Mute button
      const muteBtn = document.createElement('div');
      muteBtn.id = 'mute-btn';
      muteBtn.innerHTML = '🔊';
      muteBtn.style.cssText = \`
        width: 32px;
        height: 32px;
        background: rgba(100, 180, 255, 0.85);
        color: white;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        user-select: none;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,0.2);
      \`;

      // Help button
      const helpBtn = document.createElement('div');
      helpBtn.id = 'help-btn';
      helpBtn.innerHTML = '?';
      helpBtn.style.cssText = \`
        width: 28px;
        height: 28px;
        background: rgba(100, 180, 255, 0.6);
        color: white;
        font-size: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        user-select: none;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,0.2);
      \`;

      // Tooltip popup
      const tooltip = document.createElement('div');
      tooltip.id = 'help-tooltip';
      tooltip.style.cssText = \`
        position: fixed;
        top: 60px;
        right: 12px;
        background: rgba(0,0,0,0.85);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 13px;
        z-index: 10000;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        display: none;
        max-width: 250px;
        line-height: 1.6;
        pointer-events: none;
      \`;
      tooltip.innerHTML = \`
        <strong>Key Bindings</strong><br>
        F11  → Toggle Fullscreen<br>
        Esc+Q → Close App (5s window)<br>
        Alt+F4 → Force Close<br>
        🔊 → Mute/Unmute<br>
        Esc or ❌ → Close Chat Window
      \`;
      document.body.appendChild(tooltip);

      let isMuted = false;

      muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteBtn.innerHTML = isMuted ? '🔇' : '🔊';
        window.electron.toggleMute(isMuted);
      });

      helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = tooltip.style.display === 'block';
        tooltip.style.display = isVisible ? 'none' : 'block';
      });

      // Close tooltip when clicking anywhere else
      document.addEventListener('click', (e) => {
        if (e.target !== helpBtn && e.target !== tooltip) {
          tooltip.style.display = 'none';
        }
      });

      // Reorder: muteBtn -> helpBtn -> toggleLabel -> toggleButton -> moveLabel -> dragButton
      container.appendChild(muteBtn);
      container.appendChild(helpBtn);
      container.appendChild(toggleLabel);
      container.appendChild(toggleButton);
      container.appendChild(moveLabel);
      container.appendChild(dragButton);
      document.body.prepend(container);

      // Corner brackets - yellow/gold - pointing outward
      const cornerStyle = document.createElement('style');
      cornerStyle.textContent = \`
        .corner-bracket {
          position: fixed;
          z-index: 999999;
          pointer-events: none;
          color: rgba(255, 200, 80, 0.35);
          font-size: 10px;
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1;
          user-select: none;
        }
      \`;
      document.head.appendChild(cornerStyle);

      const tl = document.createElement('div');
      tl.className = 'corner-bracket';
      tl.textContent = '╭';
      tl.style.cssText = 'top:0px;left:0px;padding:0;';
      document.body.appendChild(tl);

      const tr = document.createElement('div');
      tr.className = 'corner-bracket';
      tr.textContent = '╮';
      tr.style.cssText = 'top:0px;right:0px;padding:0;';
      document.body.appendChild(tr);

      const bl = document.createElement('div');
      bl.className = 'corner-bracket';
      bl.textContent = '╰';
      bl.style.cssText = 'bottom:0px;left:0px;padding:0;';
      document.body.appendChild(bl);

      const br = document.createElement('div');
      br.className = 'corner-bracket';
      br.textContent = '╯';
      br.style.cssText = 'bottom:0px;right:0px;padding:0;';
      document.body.appendChild(br);

      function updateCorners() {
        const isFullscreen = window.innerHeight === screen.height && window.innerWidth === screen.width;
        const brackets = document.querySelectorAll('.corner-bracket');
        brackets.forEach(b => {
          b.style.display = isFullscreen ? 'none' : 'block';
        });
      }

      window.addEventListener('resize', updateCorners);
      setInterval(updateCorners, 500);
      updateCorners();

      toggleButton.addEventListener('click', () => {
        window.electron.sendF11();
      });

      let hideTimer;
      document.addEventListener('mousemove', (e) => {
        if (e.clientY < 80) {
          container.style.opacity = '1';
          clearTimeout(hideTimer);
        } else {
          hideTimer = setTimeout(() => {
            container.style.opacity = '0';
          }, 800);
        }
      });

      dragButton.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });

      function checkFullscreen() {
        const isFullscreen = window.innerHeight === screen.height && window.innerWidth === screen.width;
        if (isFullscreen) {
          moveLabel.style.display = 'none';
          dragButton.style.display = 'none';
          toggleLabel.textContent = 'Windowed';
        } else {
          moveLabel.style.display = 'inline';
          dragButton.style.display = 'flex';
          toggleLabel.textContent = 'Toggle Screen';
        }
      }

      window.addEventListener('resize', checkFullscreen);
      setInterval(checkFullscreen, 500);
      checkFullscreen();
    `);
  });

  mainWindow.webContents.on('did-navigate', () => {
    mainWindow.webContents.executeJavaScript(`
      if (!document.getElementById('drag-container')) {
        const container = document.createElement('div');
        container.id = 'drag-container';
        container.style.cssText = \`
          position: fixed;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        \`;
        
        const toggleLabel = document.createElement('span');
        toggleLabel.id = 'toggle-label';
        toggleLabel.textContent = 'Toggle Screen';
        toggleLabel.style.cssText = \`
          color: white;
          font-size: 13px;
          font-family: 'Segoe UI', Arial, sans-serif;
          background: rgba(0,0,0,0.65);
          padding: 6px 14px 6px 12px;
          border-radius: 6px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.12);
          pointer-events: none;
          white-space: nowrap;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
          letter-spacing: 0.3px;
        \`;
        
        const toggleButton = document.createElement('div');
        toggleButton.id = 'toggle-button';
        toggleButton.innerHTML = '⛶';
        toggleButton.style.cssText = \`
          width: 32px;
          height: 32px;
          background: rgba(100, 180, 255, 0.85);
          color: white;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          user-select: none;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.2);
        \`;

        const moveLabel = document.createElement('span');
        moveLabel.id = 'drag-label';
        moveLabel.textContent = 'Move Screen';
        moveLabel.style.cssText = \`
          color: white;
          font-size: 13px;
          font-family: 'Segoe UI', Arial, sans-serif;
          background: rgba(0,0,0,0.65);
          padding: 6px 14px 6px 12px;
          border-radius: 6px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.12);
          pointer-events: none;
          white-space: nowrap;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
          letter-spacing: 0.3px;
        \`;
        
        const dragButton = document.createElement('div');
        dragButton.id = 'drag-button';
        dragButton.innerHTML = '⣿';
        dragButton.style.cssText = \`
          width: 32px;
          height: 32px;
          background: rgba(100, 180, 255, 0.85);
          color: white;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: move;
          pointer-events: auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s ease;
          user-select: none;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.2);
          -webkit-app-region: drag;
        \`;

        // Mute button
        const muteBtn = document.createElement('div');
        muteBtn.id = 'mute-btn';
        muteBtn.innerHTML = '🔊';
        muteBtn.style.cssText = \`
          width: 32px;
          height: 32px;
          background: rgba(100, 180, 255, 0.85);
          color: white;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          user-select: none;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.2);
        \`;

        // Help button
        const helpBtn = document.createElement('div');
        helpBtn.id = 'help-btn';
        helpBtn.innerHTML = '?';
        helpBtn.style.cssText = \`
          width: 28px;
          height: 28px;
          background: rgba(100, 180, 255, 0.6);
          color: white;
          font-size: 16px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          user-select: none;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.2);
        \`;

        const tooltip = document.createElement('div');
        tooltip.id = 'help-tooltip';
        tooltip.style.cssText = \`
          position: fixed;
          top: 60px;
          right: 12px;
          background: rgba(0,0,0,0.85);
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 13px;
          z-index: 10000;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          display: none;
          max-width: 250px;
          line-height: 1.6;
          pointer-events: none;
        \`;
        tooltip.innerHTML = \`
          <strong>Key Bindings</strong><br>
          F11  → Toggle Fullscreen<br>
          Esc+Q → Close App (5s window)<br>
          Alt+F4 → Force Close<br>
          🔊 → Mute/Unmute<br>
          Esc or ❌ → Close Chat Window
        \`;
        document.body.appendChild(tooltip);

        let isMuted = false;

        muteBtn.addEventListener('click', () => {
          isMuted = !isMuted;
          muteBtn.innerHTML = isMuted ? '🔇' : '🔊';
          window.electron.toggleMute(isMuted);
        });

        helpBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isVisible = tooltip.style.display === 'block';
          tooltip.style.display = isVisible ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
          if (e.target !== helpBtn && e.target !== tooltip) {
            tooltip.style.display = 'none';
          }
        });

        container.appendChild(muteBtn);
        container.appendChild(helpBtn);
        container.appendChild(toggleLabel);
        container.appendChild(toggleButton);
        container.appendChild(moveLabel);
        container.appendChild(dragButton);
        document.body.prepend(container);

        // Corner brackets - yellow/gold - pointing outward
        const cornerStyle = document.createElement('style');
        cornerStyle.textContent = \`
          .corner-bracket {
            position: fixed;
            z-index: 999999;
            pointer-events: none;
            color: rgba(255, 200, 80, 0.35);
            font-size: 10px;
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1;
            user-select: none;
          }
        \`;
        document.head.appendChild(cornerStyle);

        const tl = document.createElement('div');
        tl.className = 'corner-bracket';
        tl.textContent = '╭';
        tl.style.cssText = 'top:0px;left:0px;padding:0;';
        document.body.appendChild(tl);

        const tr = document.createElement('div');
        tr.className = 'corner-bracket';
        tr.textContent = '╮';
        tr.style.cssText = 'top:0px;right:0px;padding:0;';
        document.body.appendChild(tr);

        const bl = document.createElement('div');
        bl.className = 'corner-bracket';
        bl.textContent = '╰';
        bl.style.cssText = 'bottom:0px;left:0px;padding:0;';
        document.body.appendChild(bl);

        const br = document.createElement('div');
        br.className = 'corner-bracket';
        br.textContent = '╯';
        br.style.cssText = 'bottom:0px;right:0px;padding:0;';
        document.body.appendChild(br);

        function updateCorners() {
          const isFullscreen = window.innerHeight === screen.height && window.innerWidth === screen.width;
          const brackets = document.querySelectorAll('.corner-bracket');
          brackets.forEach(b => {
            b.style.display = isFullscreen ? 'none' : 'block';
          });
        }

        window.addEventListener('resize', updateCorners);
        setInterval(updateCorners, 500);
        updateCorners();

        toggleButton.addEventListener('click', () => {
          window.electron.sendF11();
        });

        let hideTimer;
        document.addEventListener('mousemove', (e) => {
          if (e.clientY < 80) {
            container.style.opacity = '1';
            clearTimeout(hideTimer);
          } else {
            hideTimer = setTimeout(() => {
              container.style.opacity = '0';
            }, 800);
          }
        });

        dragButton.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });

        function checkFullscreen() {
          const isFullscreen = window.innerHeight === screen.height && window.innerWidth === screen.width;
          if (isFullscreen) {
            moveLabel.style.display = 'none';
            dragButton.style.display = 'none';
            toggleLabel.textContent = 'Windowed';
          } else {
            moveLabel.style.display = 'inline';
            dragButton.style.display = 'flex';
            toggleLabel.textContent = 'Toggle Screen';
          }
        }

        window.addEventListener('resize', checkFullscreen);
        setInterval(checkFullscreen, 500);
        checkFullscreen();
      }
    `);
  });

  let exitTimer = null;
  let escapePressed = false;

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11') {
      event.preventDefault();
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }

    if (input.key === 'F4' && input.alt) {
      event.preventDefault();
      app.quit();
    }

    if (input.key === 'Escape' && input.type === 'keyDown') {
      if (!escapePressed) {
        escapePressed = true;
        if (exitTimer) clearTimeout(exitTimer);
        exitTimer = setTimeout(() => {
          escapePressed = false;
          exitTimer = null;
        }, 5000);
      }
    }

    if (input.key === 'q' && input.type === 'keyDown' && escapePressed) {
      event.preventDefault();
      if (exitTimer) clearTimeout(exitTimer);
      app.quit();
    }
  });
}

app.whenReady().then(createWindow);