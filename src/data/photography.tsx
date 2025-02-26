// Example Photography Post Content from Sanity
// This represents what would be stored in your Sanity database

const examplePhotographyPost = {
    _type: 'photography',
    title: 'Mountain Serenity: A Journey Through Alpine Landscapes',
    slug: {
        _type: 'slug',
        current: 'mountain-serenity-alpine-landscapes'
    },
    publishedAt: '2025-02-01T08:00:00Z',
    mainImage: {
        _type: 'image',
        asset: {
            _ref: 'image-123456abcdef-3000x2000-jpg'
        },
        alt: 'Dramatic mountain peak with morning mist in the valleys below',
        caption: 'Dawn breaks over the Eastern Alps, revealing a sea of clouds below'
    },
    author: {
        _ref: 'author-johndoe',
        _type: 'reference'
    },
    excerpt: 'An exploration of light, weather, and terrain in the majestic Alpine mountain ranges. This collection captures the serene beauty and dramatic power of high-altitude landscapes.',

    // Content Blocks - The new modular content structure
    content: [
        // Text Block
        {
            _type: 'textBlock',
            heading: 'The Journey Begins',
            content: [
                {
                    _type: 'block',
                    style: 'normal',
                    children: [
                        {
                            _type: 'span',
                            text: 'The journey to capture these images began three years ago, when I first became fascinated with the interplay of light and atmosphere in mountain environments. What started as a weekend hobby evolved into a passion project spanning multiple seasons and weather conditions.'
                        }
                    ]
                },
                {
                    _type: 'block',
                    style: 'normal',
                    children: [
                        {
                            _type: 'span',
                            text: 'Each photograph in this series represents hours of hiking, waiting, and sometimes sheer luck as nature revealed its most stunning moments.'
                        }
                    ]
                }
            ]
        },

        // Featured Image Block
        {
            _type: 'featuredImageBlock',
            image: {
                _type: 'image',
                asset: {
                    _ref: 'image-abcdef123456-4000x2667-jpg'
                },
                alt: 'Sunlight breaking through clouds over alpine valley',
                caption: 'Divine Light: Crepuscular rays illuminate the valley after a summer storm'
            },
            size: 'fullWidth',
            imageMetadata: {
                camera: { _ref: 'camera-sonya7riv', _type: 'reference' },
                lens: { _ref: 'lens-sony1635gm', _type: 'reference' },
                aperture: 'f/11',
                shutterSpeed: '1/125s',
                iso: 100
            },
            showMetadata: true
        },

        // Text Block
        {
            _type: 'textBlock',
            heading: 'Chasing the Light',
            content: [
                {
                    _type: 'block',
                    style: 'normal',
                    children: [
                        {
                            _type: 'span',
                            text: 'Mountain photography is largely about patience and anticipation. The quality of light can transform a scene in seconds, turning the ordinary into the extraordinary. I learned to predict how light would interact with the landscape by studying weather patterns and topography.'
                        }
                    ]
                }
            ]
        },

        // Gallery Block
        {
            _type: 'galleryBlock',
            title: 'Seasons of the Mountains',
            layout: 'grid',
            images: [
                {
                    _type: 'image',
                    asset: {
                        _ref: 'image-spring123-3500x2333-jpg'
                    },
                    alt: 'Alpine meadow with spring flowers and snowy peaks',
                    caption: 'Spring: New life emerges as snow retreats to higher elevations',
                    imageMetadata: {
                        camera: { _ref: 'camera-sonya7riv', _type: 'reference' },
                        lens: { _ref: 'lens-sony70200gm', _type: 'reference' },
                        aperture: 'f/8',
                        shutterSpeed: '1/250s',
                        iso: 200
                    }
                },
                {
                    _type: 'image',
                    asset: {
                        _ref: 'image-summer456-3500x2333-jpg'
                    },
                    alt: 'Lush green valleys with dramatic cloudy sky',
                    caption: 'Summer: Rich vegetation and dramatic weather patterns',
                    imageMetadata: {
                        camera: { _ref: 'camera-sonya7riv', _type: 'reference' },
                        lens: { _ref: 'lens-sony1635gm', _type: 'reference' },
                        aperture: 'f/11',
                        shutterSpeed: '1/125s',
                        iso: 100
                    }
                },
                {
                    _type: 'image',
                    asset: {
                        _ref: 'image-autumn789-3500x2333-jpg'
                    },
                    alt: 'Golden autumn foliage with mountain backdrop',
                    caption: 'Autumn: The landscape transforms with vibrant colors',
                    imageMetadata: {
                        camera: { _ref: 'camera-sonya7riv', _type: 'reference' },
                        lens: { _ref: 'lens-sony24105g', _type: 'reference' },
                        aperture: 'f/9',
                        shutterSpeed: '1/160s',
                        iso: 100
                    }
                },
                {
                    _type: 'image',
                    asset: {
                        _ref: 'image-winter012-3500x2333-jpg'
                    },
                    alt: 'Snow-covered peaks with dramatic clouds',
                    caption: 'Winter: Stark beauty emerges in the colder months',
                    imageMetadata: {
                        camera: { _ref: 'camera-sonya7riv', _type: 'reference' },
                        lens: { _ref: 'lens-sony70200gm', _type: 'reference' },
                        aperture: 'f/10',
                        shutterSpeed: '1/200s',
                        iso: 100
                    }
                }
            ]
        },

        // Quote Block
        {
            _type: 'quoteBlock',
            quote: 'Mountains are not stadiums where I satisfy my ambition to achieve, they are the cathedrals where I practice my religion.',
            attribution: 'Anatoli Boukreev',
            style: 'pullQuote'
        },

        // Divider
        {
            _type: 'divider',
            style: 'stars'
        },

        // Behind the Scenes Block
        {
            _type: 'behindTheScenesBlock',
            title: 'The Making Of: Alpine Sunrise',
            description: [
                {
                    _type: 'block',
                    style: 'normal',
                    children: [
                        {
                            _type: 'span',
                            text: 'Capturing the perfect alpine sunrise required a 3am start, a two-hour hike in the dark, and setting up equipment by headlamp. The temperature was just below freezing, with wind gusts making the tripod setup particularly challenging.'
                        }
                    ]
                }
            ],
            images: [
                {
                    _type: 'image',
                    asset: {
                        _ref: 'image-bts1-2000x1333-jpg'
                    },
                    alt: 'Photographer setting up tripod on mountain ridge before sunrise',
                    caption: 'Setting up before dawn, at -2°C with gusty conditions'
                },
                {
                    _type: 'image',
                    asset: {
                        _ref: 'image-bts2-2000x1333-jpg'
                    },
                    alt: 'Camera equipment with lens filters arranged on rock',
                    caption: 'Essential gear: Camera, lenses, filters, and plenty of hand warmers'
                }
            ]
        },

        // Technical Specs Block
        {
            _type: 'techSpecsBlock',
            title: 'Essential Equipment Used',
            specs: [
                { label: 'Primary Camera', value: 'Sony Alpha a7R IV' },
                { label: 'Backup Camera', value: 'Sony Alpha a7 III' },
                { label: 'Main Lenses', value: 'Sony 16-35mm f/2.8 GM, Sony 70-200mm f/2.8 GM' },
                { label: 'Tripod', value: 'Really Right Stuff TFC-14 with BH-40 Ball Head' },
                { label: 'Filters', value: 'NiSi V6 System with GND & ND Filters' },
                { label: 'Other', value: 'Remote trigger, extra batteries, microfiber cloths' }
            ],
            layout: 'table'
        },

        // Text Block Conclusion
        {
            _type: 'textBlock',
            heading: 'Final Thoughts',
            content: [
                {
                    _type: 'block',
                    style: 'normal',
                    children: [
                        {
                            _type: 'span',
                            text: "This project taught me as much about myself as it did about photography. The mountains demand respect, patience, and humility. They've given me some of my most challenging moments as a photographer, but also my most rewarding."
                        }
                    ]
                },
                {
                    _type: 'block',
                    style: 'normal',
                    children: [
                        {
                            _type: 'span',
                            text: 'I hope these images convey some of the peace and perspective that high places have given me over the years.'
                        }
                    ]
                }
            ]
        }
    ],

    // Metadata
    location: {
        name: 'Eastern Alps',
        city: 'Various Locations',
        country: 'Austria, Switzerland, Italy',
        coordinates: {
            _type: 'geopoint',
            lat: 46.6406,
            lng: 11.9706
        }
    },
    tags: [
        'Landscape',
        'Mountains',
        'Alpine',
        'Sunrise',
        'Weather',
        'Seasons',
        'Long Exposure'
    ],
    shootMetadata: {
        theme: 'Landscape',
        equipment: {
            cameras: [
                { _ref: 'camera-sonya7riv', _type: 'reference' },
                { _ref: 'camera-sonya7iii', _type: 'reference' }
            ],
            lenses: [
                { _ref: 'lens-sony1635gm', _type: 'reference' },
                { _ref: 'lens-sony70200gm', _type: 'reference' },
                { _ref: 'lens-sony24105g', _type: 'reference' }
            ]
        },
        technicalNotes: 'Series shot primarily during golden hour (sunrise/sunset) and in various weather conditions. Focus stacking used for many of the wider landscape shots to ensure front-to-back sharpness. Polarizing filter used to manage reflections and enhance saturation in good weather; ND filters used for long exposures of moving clouds and water.'
    },
    relatedContent: [
        { _ref: 'photography-forest-mysteries', _type: 'reference' },
        { _ref: 'photography-water-reflections', _type: 'reference' }
    ]
};

export default examplePhotographyPost;