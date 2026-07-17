import React from 'react';
import { ClockIcon, TruckIcon } from 'lucide-react';
export function AboutUs() {
  return <div className="min-h-screen bg-navy py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-fire py-8 px-6 text-center">
            <h1 className="text-4xl font-bold text-white">About FireLink SL</h1>
            <p className="text-white/90 mt-2 text-lg">
              The History of the Colombo Fire Brigade
            </p>
          </div>
          {/* Content */}
          <div className="p-6 md:p-10">
            {/* Introduction */}
            <div className="flex flex-col md:flex-row items-start gap-6 mb-12">
              <div className="bg-amber/10 rounded-2xl p-4 flex items-center justify-center md:w-1/4">
                <div className="w-20 h-20 text-amber" />
              </div>
              <div className="md:w-3/4">
                <h2 className="text-2xl font-bold text-fire mb-4">
                  Our Origins
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  The Colombo Fire Brigade started in the late 1800s. At that
                  time, the water pot was used to put out the fire. There is
                  evidence that the Colombo Fire Brigade officially started in
                  1898, and there was a permanent building in 1900. At this
                  time, a cart equipped with a water tank pulled by 4 men with
                  iron wheels was used to extinguish the fire.
                </p>
              </div>
            </div>
            {/* Timeline */}
            <div className="space-y-12">
              {/* Era 1 */}
              <div className="timeline-item">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <div className="bg-navy/10 rounded-2xl p-4 flex flex-col items-center justify-center">
                      <ClockIcon className="w-12 h-12 text-navy" />
                      <span className="mt-2 font-bold">1905-1913</span>
                    </div>
                  </div>
                  <div className="md:w-3/4">
                    <h3 className="text-xl font-bold text-fire">
                      Early Development
                    </h3>
                    <p className="text-gray-700 mt-3 leading-relaxed">
                      In the year 1905, Mr. L. A. B. Pill, a British national,
                      became the chief of the Colombo Fire Brigade. Until then,
                      the number of employees, consisting of 09 people,
                      increased to 19 people. Horse-drawn carts and man-operated
                      hand pumps were used instead of water-drawn tanks. The
                      permanent building of the fire brigade was the old
                      building between Reclamation Road and Bangasala Street in
                      Pettah near the harbour. 1905-1913 was the reign of Mr.
                      Pill.
                    </p>
                  </div>
                </div>
              </div>
              {/* Era 2 */}
              <div className="timeline-item">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <div className="bg-navy/10 rounded-2xl p-4 flex flex-col items-center justify-center">
                      <TruckIcon className="w-12 h-12 text-navy" />
                      <span className="mt-2 font-bold">1913-1931</span>
                    </div>
                  </div>
                  <div className="md:w-3/4">
                    <h3 className="text-xl font-bold text-fire">
                      Mechanization Era
                    </h3>
                    <p className="text-gray-700 mt-3 leading-relaxed">
                      After that, Mr. PH Lanway, a British national, became the
                      chief officer. At that time, the service entered a
                      mechanized age. Chariots have retired from the fire
                      brigade. By 1923, the fire brigade had increased to 45
                      personnel and had two ambulances, two pumps, a water
                      tender and four fire engines, two chillscapes (wheeled
                      life ladders). The firemen had to work continuously for
                      six days and nights and only got one day off. In 1929,
                      during the labor struggle, a fire truck was attacked and
                      set on fire.
                    </p>
                  </div>
                </div>
              </div>
              {/* Era 3 */}
              <div className="timeline-item">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <div className="bg-navy/10 rounded-2xl p-4 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 text-navy" />
                      <span className="mt-2 font-bold">1931-1946</span>
                    </div>
                  </div>
                  <div className="md:w-3/4">
                    <h3 className="text-xl font-bold text-fire">
                      Local Leadership
                    </h3>
                    <p className="text-gray-700 mt-3 leading-relaxed">
                      From 1931 to 1933, Mr. Mak served as the chief officer. In
                      1933, the first Sinhala Sri Lankan was appointed to the
                      position of chief officer. He is Mr. BE Weerasinghe. In
                      1938, an additional volunteer fire brigade was formed
                      during World War II. In 1944, the volunteer fire brigade
                      was disbanded and only the permanent fire service was
                      employed. Those in the know say that when Japan bombed Sri
                      Lanka (Colombo) during the Second World War, the bomb that
                      was thrown at the fire brigade headquarters fell on the
                      fish market. Mr. Weerasinghe retired in 1946.
                    </p>
                  </div>
                </div>
              </div>
              {/* Era 4 */}
              <div className="timeline-item">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <div className="bg-navy/10 rounded-2xl p-4 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 text-navy" />
                      <span className="mt-2 font-bold">1946-1969</span>
                    </div>
                  </div>
                  <div className="md:w-3/4">
                    <h3 className="text-xl font-bold text-fire">
                      Modern Developments
                    </h3>
                    <p className="text-gray-700 mt-3 leading-relaxed">
                      C.T. Mr. Perera became chief after Weerasinghe's
                      retirement. During this time, the fire brigade received a
                      new impetus. A few modern cars were also acquired. The
                      system of working six days and taking one day off was
                      changed and the system of working two days and taking one
                      day off was started. By 1958, the number of firefighters
                      was close to 100. When the Trincomalee naval port was
                      taken over by the British government, the Sri Lankan
                      firemen who served under the British were recruited into
                      the Colombo fire brigade. During the service of Mr. CT
                      Perera, the fire brigade had a Deputy Chief Officer for
                      the first time, Mr. G. W. De Silawa.
                    </p>
                  </div>
                </div>
              </div>
              {/* Era 5 */}
              <div className="timeline-item">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <div className="bg-navy/10 rounded-2xl p-4 flex flex-col items-center justify-center">
                      <TruckIcon className="w-12 h-12 text-navy" />
                      <span className="mt-2 font-bold">1969-1977</span>
                    </div>
                  </div>
                  <div className="md:w-3/4">
                    <h3 className="text-xl font-bold text-fire">
                      Expansion & Modernization
                    </h3>
                    <p className="text-gray-700 mt-3 leading-relaxed">
                      In 1969, C.T. Mr. Perera retired and G. Dabi. Mr. De Silva
                      took office. A new headquarters was built for the fire
                      brigade. After that, the North Colombo center and the old
                      fire brigade headquarters were closed and 35 firemen were
                      hired in his service. Due to the difficulty of working 24
                      hours a day, the international eight-hour work system was
                      implemented since 1973 with the patronage of Mr. Vincent
                      Pereira, who was the mayor at that time. A fire prevention
                      post was created after Mr. CT Perera became the Chief
                      Officer, with G.L. Mr. Peiris working as a fire prevention
                      officer.
                    </p>
                  </div>
                </div>
              </div>
              {/* Era 6 */}
              <div className="timeline-item">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <div className="bg-navy/10 rounded-2xl p-4 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 text-navy" />
                      <span className="mt-2 font-bold">1977-Present</span>
                    </div>
                  </div>
                  <div className="md:w-3/4">
                    <h3 className="text-xl font-bold text-fire">
                      Recent History
                    </h3>
                    <p className="text-gray-700 mt-3 leading-relaxed">
                      At the end of 1977, G. Dabi. Mr. De Silva retired. The
                      fire brigade was led by the deputy chief officer L.S. Mr.
                      Silva. In the last half of 1977, Mr. KMI de Silva was
                      appointed to the position of chief officer. The brigade
                      continued to evolve with modern equipment and techniques
                      to serve the growing city of Colombo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Footer Quote */}
            <div className="mt-16 text-center p-6 bg-amber/10 rounded-2xl">
              <p className="italic text-lg text-gray-700">
                "From water pots to modern fire engines, the Colombo Fire
                Brigade has evolved over more than a century, always dedicated
                to protecting the lives and property of our citizens."
              </p>
              <div className="mt-4 font-semibold text-fire">
                FireLink SL
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}