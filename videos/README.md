# STAR demo videos

The gallery uses 46 MP4 files: 32 DMC-GB, 8 Robosuite, and 6 Diffusion Policy clips.

`../video-manifest.js` defines the paths used by the page. Keep `../video_manifest.json` and `EXPECTED_FILES.txt` synchronized with that list. Run `python3 tools/check_videos.py` from the project root to check the files.

- DMC-GB clips use numbered filenames under `videos/`.
- Robosuite clips use `Door_{easy,medium,hard,video}.mp4` and `TwoArmPegInHole_{easy,medium,hard,video}.mp4` under `videos/`.
- Diffusion Policy clips use `can/{easy,medium,hard}/ours_success.mp4` and `square/{easy,medium,hard}/ours_success.mp4`.

Videos need a browser-compatible MP4 codec. For H.264 output:

```bash
ffmpeg -i input.mp4 -c:v libx264 -pix_fmt yuv420p -preset medium -crf 25 -an -movflags +faststart output.mp4
```

The page uses muted looping playback with video controls.
