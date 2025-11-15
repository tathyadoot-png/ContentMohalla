'use client'

import React, { useState, useEffect, useRef } from 'react'
// import { useSearchParams } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import api from '@/utils/api'
import 'react-toastify/dist/ReactToastify.css'

import DescriptionEditor from '@/components/DescriptionEditor'
import CategoriesTags from '@/components/CategoriesTags'
import MediaUpload from '@/components/MediaUpload'
import SubmitButtons from '@/components/SubmitButtons'
import TopInfo from './TopInfo'

const categoryList = [
  'main-news',
  'featured-stories',
  'trending-mudda',
  'jansarokar',
  "editor's-picks",
  'madhya-pradesh',
  'desh',
  'videsh',
  'rajneeti',
  'vyapaar',
  'dharm',
  'kala',
  'sports',
  'education',
  'taknik',
  'climate',
  'manoranjan',
  'health',
]

const excludedCategories = [
  'main news',
  'featured stories',
  'trending mudda',
  'jansarokar',
  "editor's picks",
]

const NewsForm = ({ id }) => {
  // const searchParams = useSearchParams()
  // const id = searchParams.get('id') // ✅ get id from query param
  const autoSaveTimer = useRef(null)

  const [editData, setEditData] = useState(null)
  const [editors, setEditors] = useState([])
  const [preview, setPreview] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    byLine: '',
    slug: '',
    createdAt: new Date().toISOString().substring(0, 10),
    description: { who: '', what: '', when: '', where: '', why: '', how: '' },
    categories: [],
    tags: [],
    authoredBy: '',
    deskLocation: '',
    image: null,
    videoUrl: '',
    audio: null,
    isBreaking: false,
  })

  // Fetch editors
  useEffect(() => {
    api
      .get('/admin/editors')
      .then((res) => setEditors(res.data || []))
      .catch((err) => console.error('Failed to fetch editors', err))
  }, [])

  // Initialize form for edit or new
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'))
    const isAdmin = currentUser?.role === 'admin'

    const initializeForm = async () => {
      if (!id) {
        // create mode
        setFormData((prev) => ({
          ...prev,
          authoredBy: isAdmin ? '' : currentUser?._id,
        }))
        return
      }

      // edit mode
      try {
        const res = await api.get(`/news/${id}`)
        console.log('Fetched news data:', res.data)
        const data = res.data.data // ✅ correct shape

        setEditData(data)
        setFormData({
          title: data.title || '',
          byLine: data.byLine || '',
          slug: data.slug || '',

          createdAt: data.createdAt
            ? new Date(data.createdAt).toISOString().slice(0, 16) // works for datetime-local
            : new Date().toISOString().slice(0, 16),

          description: data.description
            ? JSON.parse(data.description)
            : { who: '', what: '', when: '', where: '', why: '', how: '' },

          categories: Array.isArray(data.categories) ? data.categories : [],

          tags: Array.isArray(data.tags)
            ? data.tags.filter((t) => t !== '[]') // ✅ clean up
            : [],

          authoredBy: data.authoredBy?._id || '', // keep only ID for form submit
          deskLocation: data.deskLocation || '',

          image: null, // for new upload
          imageUrl: data.imageUrl || '', // preview existing
          videoUrl: data.videoUrl || '',
          audio: null,

          isBreaking: data.isBreaking ?? false,
        })
      } catch (err) {
        toast.error('Failed to load news for editing')
        console.error(err)
      }
    }

    initializeForm()
  }, [id])

  // Auto-save draft
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      if (!editData?._id) return
      handleSubmit(true)
    }, 30000)

    return () => clearInterval(autoSaveTimer.current)
  }, [formData, editData])

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (files) {
      setFormData((prev) => ({ ...prev, [name]: files }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleDescriptionChange = (newDescription) => {
    setFormData((prev) => ({ ...prev, description: newDescription }))
  }

  const clearForm = () => {
    setEditData(null)
    setFormData({
      title: '',
      byLine: '',
      slug: '',
      createdAt: new Date().toISOString().substring(0, 10),
      description: { who: '', what: '', when: '', where: '', why: '', how: '' },
      categories: [],
      tags: [],
      authoredBy: '',
      deskLocation: '',
      image: null,
      videoUrl: '',
      audio: null,
      isBreaking: false,
    })
    toast.info('Form cleared')
  }

  const handleSubmit = async (isAutoSave = false) => {
    const form = new FormData()
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        if (['categories', 'tags', 'description'].includes(key)) {
          form.append(key, JSON.stringify(formData[key]))
        } else if (formData[key] instanceof FileList) {
          form.append(key, formData[key][0])
        } else {
          form.append(key, formData[key])
        }
      }
    })

    try {
      if (editData?._id) {
        await api.put(`/news/${editData._id}`, form)
      } else {
        await api.post(`/news`, form)
      }
      if (!isAutoSave)
        toast.success(`News ${editData ? 'updated' : 'created'} successfully!`)
    } catch (err) {
      console.error(err)
      if (!isAutoSave) toast.error('Failed to save news. Please try again.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">
        {editData ? 'Edit News' : 'Publish News'}
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form Card */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-lg space-y-6">
          <TopInfo
            formData={formData}
            handleChange={handleChange}
            editors={editors}
          />
          <DescriptionEditor
            description={formData.description}
            handleDescriptionChange={handleDescriptionChange}
          />
          <CategoriesTags
            formData={formData}
            setFormData={setFormData}
            categoryList={categoryList}
            excludedCategories={excludedCategories}
          />
          <MediaUpload formData={formData} handleChange={handleChange} />
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <SubmitButtons
              editData={editData}
              handleSubmit={() => handleSubmit(false)}
              clearForm={clearForm}
            />
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={() => setPreview(!preview)}
            >
              {preview ? 'Close Preview' : 'Preview'}
            </button>
          </div>
        </div>

        {/* Live Preview */}
        {preview && (
          <div className="flex-1 bg-gray-50 p-6 rounded-xl shadow-lg overflow-auto">
            <h2 className="text-xl font-bold mb-4">Live Preview</h2>
            <div className="space-y-3">
              <p>
                <strong>Title:</strong> {formData.title}
              </p>
              <p>
                <strong>Byline:</strong> {formData.byLine}
              </p>
              <div>
                <strong>5W1H:</strong>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(formData.description).map(([key, value]) => (
                    <li key={key}>
                      <strong>
                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                      </strong>{' '}
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
              {formData.categories.length > 0 && (
                <p>
                  <strong>Categories:</strong>{' '}
                  {formData.categories.map((c) => c.name || c).join(', ')}
                </p>
              )}
              {formData.tags.length > 0 && (
                <p>
                  <strong>Tags:</strong> {formData.tags.join(', ')}
                </p>
              )}
              {formData.image && (
                <img
                  src={URL.createObjectURL(formData.image[0])}
                  alt="News"
                  className="mt-2 rounded-lg max-h-64 w-full object-cover"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewsForm
