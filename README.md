# Passport photo specs

Official photo and signature upload rules for common passport, visa and ID applications, as JSON, with the official
source for every document. Plus a small no-dependency script that checks a JPEG against the file rules.

Built while making the free in-browser photo tools at [Toolwell](https://toolwell.app/passport-photos), where every
requirement had to be traced back to a government page instead of copied from another photo site.

**Rules checked: October 2026.** Governments change these rules. Always confirm with the official source before you
apply; this repo is not affiliated with any government.

## What's covered

| Document | Digital upload | Print | File size | Tool |
|---|---|---|---|---|
| US passport | Square JPEG, at least 600 × 600 px | 2 × 2 in (51 × 51 mm), head 25–35 mm | — | [US passport photo](https://toolwell.app/us-passport-photo) |
| US visa (DS-160) | Square JPEG, 600 × 600 to 1200 × 1200 px, head 50–69% of height | 2 × 2 in, if asked for | 240 KB max | [US visa photo](https://toolwell.app/us-visa-photo) |
| DV Lottery | Exactly 600 × 600 px JPEG, head 50–69% of height | — | 240 KB max | [DV Lottery photo](https://toolwell.app/dv-lottery-photo) |
| UK passport (online) | At least 600 × 750 px, **not** cropped (head, shoulders, upper body) | — | 50 KB – 10 MB | [UK passport photo](https://toolwell.app/uk-passport-photo) |
| UK passport (paper form) | — | 35 × 45 mm, head 29–34 mm, 2 copies | — | [UK passport photo](https://toolwell.app/uk-passport-photo) |
| Schengen visa | No official rule (set by each visa centre) | 35 × 45 mm, head about 32–36 mm | — | [Schengen visa photo](https://toolwell.app/schengen-visa-photo) |
| India e-Visa | Square JPEG, 350 × 350 to 1000 × 1000 px | — | 10–300 KB | [India e-Visa photo](https://toolwell.app/india-visa-photo) |
| Indian passport (Passport Seva) | Exactly 630 × 810 px JPEG | — | under 250 KB | [Indian passport photo](https://toolwell.app/indian-passport-photo) |
| Indian passport signature | JPEG | — | 100 KB max | [Passport Seva signature](https://toolwell.app/passport-seva-signature) |
| OCI card photo | Square JPEG, 200 × 200 to 1500 × 1500 px | 2 × 2 in, head 25–35 mm | sources differ; under 200 KB is safe | [OCI photo](https://toolwell.app/oci-photo) |
| OCI card signature | JPEG, 3 × wider than tall, 200 × 67 to 1500 × 500 px | — | sources say 200 or 500 KB; under 200 KB is safe | [OCI signature](https://toolwell.app/oci-signature) |

Background, photo age, glasses, head-covering rules and the official sources for each are in
[`specs.json`](specs.json).

## Check a photo

```sh
node check-photo.mjs --list
node check-photo.mjs us-visa-ds160 photo.jpg
```

```
US visa photo (DS-160): photo.jpg

  PASS  File is a JPEG
  PASS  Size 600 × 600 px (needs at least 600 × 600)
  PASS  Size 600 × 600 px (needs at most 1200 × 1200)
  PASS  Shape 1.000:1 (needs 1:1)
  PASS  File 154.6 KB (needs at most 240 KB)
  ----  Head size not checked: it must be 50%–69% of the image height

Rules checked 2026-10. Always confirm with the official source:
  https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html
  https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/digital-image-requirements.html
```

It checks the file only: format, pixels, shape and size. It can't judge head size, background, lighting or expression.
Exit code 0 means every file rule passed and 2 means at least one failed.

## Notes on the data

- **KB means 1,000 bytes.** Upload forms differ on whether 1 KB is 1,000 or 1,024 bytes. A file under the 1,000-byte
  figure passes both, so the checker uses that.
- **Sources disagree sometimes.** OCI file-size limits are quoted differently by the official PDF, VFS Global and
  embassy pages. Where that happens, the note in `specs.json` says so and gives the safe choice.
- **Don't edit the photo.** The US, UK, DV and OCI rules all reject altered or retouched photos, so a tool that
  "fixes" the background can get a photo rejected. Crop and size only.

## Corrections

Found a rule that has changed? Open an issue or pull request with a link to the official page.

## License

Data (`specs.json`) is licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): reuse it freely, with a
link to this repository or [toolwell.app](https://toolwell.app). The script is MIT ([LICENSE](LICENSE)).
