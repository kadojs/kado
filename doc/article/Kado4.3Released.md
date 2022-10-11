# Kado 4.3 Released
*By Bryan Tong 10/11/22*

Kado 4.3 has been releases since February 2022 and stabilizes the big additions
made in Kado 4.2.

Most of the Kado 4.3 features and changes come from real life testing and
production feedback. This release focuses on consistent error handling and
stability in public.

Our team has been continuing the security review and testing of Kado. To this
point, we have had great success.

Here is an overview of the primary additions:
* Fix bug in Format.cookie() [!277](https://git.nullivex.com/kado/kado/-/merge_requests/277)
* Use +00:00 for SQL timezone [!288](https://git.nullivex.com/kado/kado/-/merge_requests/288)
* Raise cluster default timeouts [!284](https://git.nullivex.com/kado/kado/-/merge_requests/284)
* Fix URI Decoding [!283](https://git.nullivex.com/kado/kado/-/merge_requests/283)
* Parameters are now sent through JSON first [!282](https://git.nullivex.com/kado/kado/-/merge_requests/282)
* Improved query string handling [!274](https://git.nullivex.com/kado/kado/-/merge_requests/274)
* Add BigInteger library [!271](https://git.nullivex.com/kado/kado/-/merge_requests/271)
* Add PromiseMore library [!264](https://git.nullivex.com/kado/kado/-/merge_requests/264)
* Add LogRelay via UDP [!261](https://git.nullivex.com/kado/kado/-/merge_requests/261)
* Add logging support [!253](https://git.nullivex.com/kado/kado/-/merge_requests/253)
* Continuously build Kado against Node 10, 12, 14 [!289](https://git.nullivex.com/kado/kado/-/merge_requests/289)
* Fix static file handling with query args [!275](https://git.nullivex.com/kado/kado/-/merge_requests/275)
* Add Cookie Builder [!276](https://git.nullivex.com/kado/kado/-/merge_requests/276)
* Add HTTP request logger [!256](https://git.nullivex.com/kado/kado/-/merge_requests/256)
* Add Mutlipart processing [!244](https://git.nullivex.com/kado/kado/-/merge_requests/244)
* Add foreign key support to schema [!222](https://git.nullivex.com/kado/kado/-/merge_requests/222)
* Various other improvements and fixes see [%v4.3.0](https://git.nullivex.com/kado/kado/-/milestones/5#tab-merge-requests)

There are more! See our [CHANGELOG](../../CHANGELOG.md)

With all that being said, Kado 4.4 is right around the corner. We have major
new additions as well as fixes to existing content.

What have we been busy with? Writing applications with Kado! Which is what we
spent our time creating this project for. All the targets have been a continual
hit. Kado aims for long term success. Consider switching your project today.

Sincerely,

The Kado Team
