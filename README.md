# STAR project page

**Control First, Robustness Next: Decoupled Representation Learning for Visual RL Generalization**  
Chanyong Heo, Hyelyn Jeong, Jongchan Park, Seungjun Oh, Yusung Kim · Sungkyunkwan University

- Project page: https://mark-98.github.io/star-project-page/
- Repository: https://github.com/Mark-98/star-project-page
- Paper: [paper.pdf](paper.pdf)

정적 HTML/CSS/JavaScript 사이트입니다. Node, bundler, Jekyll 또는 별도 서버가 필요하지 않습니다.

## 로컬 미리보기

```bash
cd /home/chan/star-project-page
python3 -m http.server 8000
```

브라우저에서 http://localhost:8000/ 을 엽니다.

## GitHub Pages 배포

GitHub Pages의 게시 소스는 `main` 브랜치의 루트(`/`)입니다. `.nojekyll`을 통해 정적 파일을 그대로 제공합니다.

수정 사항을 저장소에 push하면 GitHub Pages가 자동으로 다시 배포합니다.

```bash
git add .
git commit -m "Update STAR project page"
git push origin main
```

배포 상태는 저장소의 **Actions** 또는 **Settings → Pages**에서 확인할 수 있습니다.

## 사이트 수정

| 파일 | 용도 |
| --- | --- |
| `index.html` | 제목, 저자, 논문 내용, 결과 표, 인용문 |
| `styles.css` | 데스크톱/모바일 레이아웃과 스타일 |
| `script.js` | 영상 필터, 결과 탭, 인용문 복사 |
| `video-manifest.js` | 페이지에서 사용하는 영상 목록 |
| `video_manifest.json` | 검사 도구용 영상 목록 사본 |
| `videos/EXPECTED_FILES.txt` | 필요한 영상 경로 목록 |
| `paper.pdf`, `citation.bib` | 논문과 BibTeX |
| `assets/` | 논문 그림, 벤치마크 예시, favicon |

## 영상

페이지에는 DMC-GB 32개, Robosuite 8개, Diffusion Policy 6개로 총 **46개**의 영상이 연결되어 있습니다. 영상 파일을 바꿀 때는 `video-manifest.js`, `video_manifest.json`, `videos/EXPECTED_FILES.txt`의 경로를 함께 갱신하세요.

```bash
python3 tools/check_videos.py
```

DMC 회전/이동 영상은 STAR(G), appearance 영상은 STAR(O)로 표시됩니다. Diffusion Policy 영상은 PRA 성공 예시입니다. 영상 카드는 환경, 작업, 난이도를 표시하며, 화면에 보이는 영상이 음소거 상태로 반복 재생됩니다.

GitHub Pages의 게시 사이트 용량 한도는 [1 GB](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)입니다. 큰 영상은 압축하거나 외부 호스팅을 사용하세요. [Git LFS는 GitHub Pages에서 지원되지 않습니다](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages).

## 논문 그림

Figures 1 and 2는 SVG와 고해상도 PNG로 제공됩니다. 벤치마크 예시 그림은 전체 해상도로 열 수 있고 모바일에서는 가로로 스크롤할 수 있습니다.

새 논문 PDF에서 그림을 다시 추출하려면 `pymupdf`, `pillow`를 설치한 뒤 `python3 tools/build_hires_assets.py`를 실행하세요. 이 도구의 좌표는 제공된 29페이지 논문에 맞춰져 있으므로 PDF 레이아웃이 바뀌면 확인이 필요합니다.
