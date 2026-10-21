# davidthomasorganist.co.uk

Text, photos and recordings live in `content/*.yml` and are edited in
[Pages CMS](https://app.pagescms.org) (screens defined in `.pages.yml`).
`index.njk` is the page template and `style.css` the styling.

Every push to `main` (including every save in Pages CMS) runs
`.github/workflows/deploy.yml`, which builds the site with Eleventy, resizes
photos to at most 1600px (WebP + JPEG) and uploads to the S3 bucket.

The contact form posts to Formspree (`https://formspree.io/f/xdearywg`, set as
`site.formAction` in `eleventy.config.js`); spam filtering and the reCAPTCHA check are
configured in the Formspree dashboard. Google reviews are fetched from the Places API at build time (GitHub secret
`GOOGLE_PLACES_KEY`, Google Cloud project `davidthomas-site-reviews`, capped at 30 lookups a
day) and built into the page; the deploy also runs daily at 06:00 UTC to refresh them. If
the lookup fails, the section links to Google instead.

## Local preview

```bash
npm install
npm start        # http://localhost:8080
```

## One-time setup

1. **IAM user for deploys.** Create a user with only this policy, then create an access key for it:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": "s3:ListBucket",
         "Resource": "arn:aws:s3:::davidthomasorganist.co.uk"
       },
       {
         "Effect": "Allow",
         "Action": "s3:PutObject",
         "Resource": "arn:aws:s3:::davidthomasorganist.co.uk/*"
       }
     ]
   }
   ```

2. **GitHub secrets.** In the repo: Settings → Secrets and variables → Actions → add
   `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
3. **Pages CMS.** Sign in at `app.pagescms.org` with GitHub, install the Pages CMS GitHub
   App on this repo, open it, then invite David by email as a collaborator.

The site is served over HTTPS by CloudFront (distribution `E374ONS7HKKMDW`, on the
CloudFront **Free** flat-rate plan, $0/month with no overage charges) in front of the S3
website endpoint. The deploy clears CloudFront's cache using the repo variable
`CLOUDFRONT_DISTRIBUTION_ID`, and `www` redirects to the bare domain.

Deploys never delete anything from the bucket. Removed photos and recordings just stop
being linked from the page.
