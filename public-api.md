# Public API

## Radio routes :

### main.js :

--- 

GET : `your.domain.com/ap1/v1/radio/now_playing`

- Return data about now playing media, mountpoints and song history / song playing next

Test it with [https://www.tirnatek.fr/ap1/v1/radio/now_playing](https://www.tirnatek.fr/ap1/v1/radio/now_playing)
 
---

GET : `your.domain.com/ap1/v1/radio/nowplaying/cover/:cover`

- Return the cover of actual playing media

Test it with [https://www.tirnatek.fr/ap1/v1/radio/nowplaying/cover/0b3a663bf05d8af97cb8abc3](https://www.tirnatek.fr/ap1/v1/radio/now_playing/cover/0b3a663bf05d8af97cb8abc3)

---

GET : `your.domain.com/ap1/v1/radio/schedule`

- Return the schedule

Test it with [https://www.tirnatek.fr/ap1/v1/radio/schedule](https://www.tirnatek.fr/ap1/v1/radio/schedule)

---

GET : `your.domain.com/ap1/v1/radio/mountpoints/:mount`

- Return the mountpoint selected by argument `:mount`, configurable with azuracast

Test it with [https://www.tirnatek.fr/ap1/v1/radio/mountpoints/tntr128.mp3](https://www.tirnatek.fr/ap1/v1/radio/mountpoints/tntr128.mp3)

---

## Podcasts routes :

### artists.js

GET : `your.domain.com/ap1/v1/radio/artists`

- Return the data of all available podcasts on the station (Sorted Alphabetically, ascending)

Test it with [https://www.tirnatek.fr/ap1/v1/radio/artists](https://www.tirnatek.fr/ap1/v1/radio/artists)

---

GET : `your.domain.com/ap1/v1/radio/artists/latests`

- Return the data of the 10 latest published available podcasts on the station (Sorted by time, descending)

Test it with [https://www.tirnatek.fr/ap1/v1/radio/artists/latests](https://www.tirnatek.fr/ap1/v1/radio/artists/latests)

---

GET : `your.domain.com/ap1/v1/radio/artists/:artist_name/cover`

- Return the cover of the artist with the name corresponding to `:artist_name`

Test it with [https://www.tirnatek.fr/ap1/v1/radio/artists/aron_trk/cover](https://www.tirnatek.fr/ap1/v1/radio/artists/aron_trk/cover)

---

GET : `your.domain.com/ap1/v1/radio/artists/:artist_name/sets`

- Return the data of all sets available of the artist with the name corresponding to `:artist_name`

Test it with [https://www.tirnatek.fr/ap1/v1/radio/artists/banyar/sets](https://www.tirnatek.fr/ap1/v1/radio/artists/banyar/sets)

---

GET : `your.domain.com/ap1/v1/radio/artists/:artist_name/:episode_name/cover`

- Return the cover of the artist's (`:artist_name`) podcast with the name corresponding to `:episode_name`

Test it with [https://www.tirnatek.fr/ap1/v1/radio/artists/abritek/jam_session_mix_135_170_bpm/cover](https://www.tirnatek.fr/ap1/v1/radio/artists/abritek/jam_session_mix_135_170_bpm/cover)

---

GET : `your.domain.com/ap1/v1/radio/artists/:artist_name/:episode_name.mp3`

- Return the media of the artist's (`:artist_name`) podcast with the name corresponding to `:episode_name`

Test it with [https://www.tirnatek.fr/ap1/v1/radio/artists/bischops/bischops_private_party_15_06_24.mp3](https://www.tirnatek.fr/ap1/v1/radio/artists/bischops/bischops_private_party_15_06_24.mp3)

---


### sets.js

GET : `your.domain.com/ap1/v1/radio/sets`

- Return the data of all available podcasts episodes on the station

Test it with [https://www.tirnatek.fr/ap1/v1/radio/sets](https://www.tirnatek.fr/ap1/v1/radio/sets)

---

GET : `your.domain.com/ap1/v1/radio/sets/lastests`

- Return the data of the 10 latest published available podcasts episodes on the station

Test it with [https://www.tirnatek.fr/ap1/v1/radio/sets/latests](https://www.tirnatek.fr/ap1/v1/radio/sets/latests)

---
