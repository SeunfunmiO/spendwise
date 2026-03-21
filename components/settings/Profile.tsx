"use client"
import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, LogOut, Trash2, CheckCircle, Lock } from "lucide-react"
import Image from "next/image"
import {
  updateProfile,
  deleteAccount,
  getUserProfile,
} from "@/lib/actions/settings.actions"
import { getUserPlan } from "@/lib/actions/upgrade.actions"
import { logoutUser } from "@/lib/actions/auth.actions"
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/schemas"
import ConfirmModal from "@/components/ui/ConfirmModal"
import Link from "next/link"

export default function ProfileTab() {
  const { data: session } = useSession()
  const t = useTranslations("settings")
  const router = useRouter()

  const [avatarUrl, setAvatarUrl] = useState("")
  const [email, setEmail] = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [userPlan, setUserPlan] = useState("free")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "" },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true)
      const [profileResult, planResult] = await Promise.all([
        getUserProfile(),
        getUserPlan(),
      ])
      if (profileResult.success && profileResult.data) {
        reset({ name: profileResult.data.name })
        setAvatarUrl(profileResult.data.image ?? "")
        setEmail(profileResult.data.email)
      }
      if (planResult.success && planResult.data) {
        setUserPlan(planResult.data.plan)
      }
      setLoadingProfile(false)
    }
    fetchProfile()
  }, [reset])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const data = await res.json()
    setUploadingAvatar(false)
    if (data.url) setAvatarUrl(data.url)
  }

  const onSubmit = async (data: UpdateProfileInput) => {
    setProfileSuccess("")
    const result = await updateProfile({ name: data.name, image: avatarUrl })
    if (result.success) {
      setProfileSuccess(t("profileUpdated"))
      const updated = await getUserProfile()
      if (updated.success && updated.data) {
        reset({ name: updated.data.name })
        setAvatarUrl(updated.data.image ?? "")
      }
      setTimeout(() => setProfileSuccess(""), 3000)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    const result = await deleteAccount()
    setDeleting(false)
    if (result.success) await logoutUser()
  }

  if (loadingProfile) {
    return (
      <div className="space-y-6">
        <div className="bg-(--card) rounded-xl border border-(--border) p-6 space-y-6">
          <div className="h-20 w-20 rounded-full bg-(--secondary) animate-pulse" />
          <div className="h-10 rounded-lg bg-(--secondary) animate-pulse" />
          <div className="h-10 rounded-lg bg-(--secondary) animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Profile Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-(--card) rounded-xl border border-(--border) p-6 space-y-6"
      >
        {/* Avatar */}
        <div>
          <label className="text-sm font-medium text-(--foreground) mb-3 block">
            {t("avatar")}
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={72}
                  height={72}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-18 h-18 rounded-full bg-(--primary) flex items-center justify-center text-white text-2xl font-bold">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-(--primary) text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Camera size={13} />
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="text-sm text-(--primary) font-medium hover:underline disabled:opacity-50"
              >
                {uploadingAvatar
                  ? t("uploadingAvatar")
                  : avatarUrl
                    ? t("changeAvatar")
                    : t("uploadAvatar")}
              </button>
              <p className="text-xs text-(--muted-foreground) mt-1">{t("avatarHint")}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
            {t("name")}
          </label>
          <input
            {...register("name")}
            type="text"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-(--foreground) mb-1.5 block">
            {t("email")}
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-(--border) bg-(--secondary) text-(--muted-foreground) cursor-not-allowed"
          />
        </div>

        {/* Success */}
        {profileSuccess && (
          <p className="text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3 py-2 rounded-lg flex gap-2 items-center">
            <CheckCircle size={12} /> {profileSuccess}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? t("savingProfile") : t("saveProfile")}
        </button>
      </form>

      {/* Logout */}
      <div className="bg-(--card) rounded-xl border border-(--border) p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium text-(--foreground)">{t("logout")}</p>
            <p className="text-xs text-(--muted-foreground) mt-0.5">{t("logoutDesc")}</p>
          </div>
          <form action={logoutUser}>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--secondary) transition-colors"
            >
              <LogOut size={16} />
              {t("logout")}
            </button>
          </form>
        </div>
      </div>

      {/* Support */}
      <div className="bg-(--card) rounded-xl border border-(--border) p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-(--foreground)">
                {t("support")}
              </p>
              {userPlan === "free" && (
                <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                  Pro
                </span>
              )}
            </div>
            <p className="text-xs text-(--muted-foreground) mt-0.5">
              {userPlan === "premium" ? t("prioritySupportDesc") : t("freeSupportDesc")}
            </p>
          </div>

          {userPlan === "premium" ? (
            <Link
              href="mailto:support@spendwise.app"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t("contactSupport")}
            </Link>
          ) : (
            <button
              onClick={() => router.push("/upgrade")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) text-sm font-medium text-(--muted-foreground) hover:bg-(--secondary) transition-colors"
            >
              <Lock size={14} />
              {t("upgrade")}
            </button>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-(--card) rounded-xl border border-red-200 dark:border-red-900 p-6">
        <h3 className="text-sm font-semibold text-red-500 mb-4">{t("dangerZone")}</h3>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium text-(--foreground)">{t("deleteAccount")}</p>
            <p className="text-xs text-(--muted-foreground) mt-0.5">{t("deleteAccountDesc")}</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Trash2 size={16} />
            {t("deleteAccount")}
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title={t("deleteAccountConfirmTitle")}
        message={t("deleteAccountConfirm")}
        confirmLabel={t("deleteAccount")}
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />

    </div >
  )
}